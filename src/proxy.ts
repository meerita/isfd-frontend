/** @format */

'use server';

// File: src/proxy.ts
// Purpose: Enforce session-based access control using Next.js proxy
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { NextRequest, NextResponse } from 'next/server';

import ENV from '@/_constants/env';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_ID_COOKIE,
  decodeAccessToken,
  isTokenExpired,
  refreshAuthSession,
  shouldRefreshAccessToken,
} from '@/_lib/authTokens';
import type { AccessTokenPayload, NormalizedSession } from '@/_types/auth';

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/register',
  '/forbidden',
  '/clubs/slug',
]);
const IGNORED_PREFIXES: ReadonlyArray<string> = [
  '/_next',
  '/favicon',
  '/assets',
  '/api',
];

export async function proxy(request: NextRequest) {
  const normalizedPath = normalizePathname(request.nextUrl.pathname);

  if (shouldBypass(normalizedPath)) {
    return NextResponse.next();
  }

  const requiresAuth = !isPublicPath(normalizedPath);
  const tokenValue = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  let payload = decodeAccessToken(tokenValue);
  let sessionToPersist: NormalizedSession | null = null;
  let shouldClearCookies = false;

  if (!payload || shouldRefreshAccessToken(payload)) {
    const refreshed = await tryRefreshSession(request);

    if (refreshed) {
      sessionToPersist = refreshed.session;
      payload = refreshed.payload;
    } else if (!payload || isTokenExpired(payload)) {
      if (requiresAuth) {
        const response = NextResponse.redirect(new URL('/', request.url));
        clearAuthCookiesFromResponse(response);
        return response;
      }

      payload = null;
      shouldClearCookies = true;
    }
  }

  if (isPublicPath(normalizedPath)) {
    if (normalizedPath === '/' && payload && !isTokenExpired(payload)) {
      return applyCookieUpdates(
        NextResponse.redirect(new URL('/dashboard', request.url)),
        sessionToPersist,
        payload,
        shouldClearCookies,
      );
    }

    return applyCookieUpdates(
      NextResponse.next(),
      sessionToPersist,
      payload,
      shouldClearCookies,
    );
  }

  if (!payload || isTokenExpired(payload)) {
    const response = NextResponse.redirect(new URL('/', request.url));
    clearAuthCookiesFromResponse(response);
    return response;
  }

  return applyCookieUpdates(
    NextResponse.next(),
    sessionToPersist,
    payload,
    shouldClearCookies,
  );
}

type RefreshResult = Readonly<{
  session: NormalizedSession;
  payload: AccessTokenPayload;
}>;

async function tryRefreshSession(
  request: NextRequest,
): Promise<RefreshResult | null> {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const sessionId = request.cookies.get(SESSION_ID_COOKIE)?.value;

  if (!refreshToken || !sessionId) {
    return null;
  }

  const session = await refreshAuthSession(sessionId, refreshToken);

  if (!session) {
    return null;
  }

  const payload = decodeAccessToken(session.accessToken);

  if (!payload || isTokenExpired(payload)) {
    return null;
  }

  return { session, payload } satisfies RefreshResult;
}

function applyCookieUpdates(
  response: NextResponse,
  session: NormalizedSession | null,
  payload: AccessTokenPayload | null,
  shouldClear: boolean,
): NextResponse {
  if (session && payload) {
    persistSessionInResponse(response, session);
    return response;
  }

  if (shouldClear) {
    clearAuthCookiesFromResponse(response);
  }

  return response;
}

function persistSessionInResponse(
  response: NextResponse,
  session: NormalizedSession,
): void {
  const secure = process.env.NODE_ENV === 'production';

  function isoToMaxAge(isoString: string): number {
    const expiresAt = new Date(isoString).getTime();
    return Math.max(Math.floor((expiresAt - Date.now()) / 1000), 0);
  }

  const accessTokenMaxAge = isoToMaxAge(session.accessTokenExpiresAt);
  const refreshTokenMaxAge = isoToMaxAge(session.refreshTokenExpiresAt);

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: session.accessToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: accessTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: session.refreshToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: refreshTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });

  response.cookies.set({
    name: SESSION_ID_COOKIE,
    value: session.sessionId,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: refreshTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });
}

function clearAuthCookiesFromResponse(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(SESSION_ID_COOKIE);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function shouldBypass(pathname: string): boolean {
  return IGNORED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function normalizePathname(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/$/, '') || '/';
}
