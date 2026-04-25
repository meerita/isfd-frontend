/** @format */

'use server';

// File: src/proxy.ts
// Purpose: Enforce session and role-based access using Next.js proxy
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { NextRequest, NextResponse } from 'next/server';

import ENV from '@/_constants/env';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  decodeAccessToken,
  isTokenExpired,
  refreshAuthSession,
  shouldRefreshAccessToken,
} from '@/_lib/authTokens';
import type { AccessTokenPayload, NormalizedAuthTokens } from '@/_types/auth';

const PUBLIC_PATHS: ReadonlySet<string> = new Set(['/', '/forbidden']);
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
  let tokensToPersist: NormalizedAuthTokens | null = null;
  let shouldClearCookies = false;

  if (!payload || shouldRefreshAccessToken(payload)) {
    const refreshed = await tryRefreshSession(request);

    if (refreshed) {
      tokensToPersist = refreshed.tokens;
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
    if (normalizedPath === '/' && payload?.isAdmin) {
      return applyCookieUpdates(
        NextResponse.redirect(new URL('/dashboard', request.url)),
        tokensToPersist,
        payload,
        shouldClearCookies,
      );
    }

    return applyCookieUpdates(
      NextResponse.next(),
      tokensToPersist,
      payload,
      shouldClearCookies,
    );
  }

  if (!payload) {
    const response = NextResponse.redirect(new URL('/', request.url));
    clearAuthCookiesFromResponse(response);
    return response;
  }

  if (!payload.isAdmin) {
    return applyCookieUpdates(
      NextResponse.redirect(new URL('/forbidden', request.url)),
      tokensToPersist,
      payload,
      shouldClearCookies,
    );
  }

  return applyCookieUpdates(
    NextResponse.next(),
    tokensToPersist,
    payload,
    shouldClearCookies,
  );
}

type RefreshResult = Readonly<{
  tokens: NormalizedAuthTokens;
  payload: AccessTokenPayload;
}>;

async function tryRefreshSession(
  request: NextRequest,
): Promise<RefreshResult | null> {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const tokens = await refreshAuthSession(refreshToken);

  if (!tokens) {
    return null;
  }

  const payload = decodeAccessToken(tokens.accessToken);

  if (!payload || isTokenExpired(payload)) {
    return null;
  }

  return { tokens, payload } satisfies RefreshResult;
}

function applyCookieUpdates(
  response: NextResponse,
  tokens: NormalizedAuthTokens | null,
  payload: AccessTokenPayload | null,
  shouldClear: boolean,
): NextResponse {
  if (tokens && payload) {
    persistTokensInResponse(response, tokens, payload);
    return response;
  }

  if (shouldClear) {
    clearAuthCookiesFromResponse(response);
  }

  return response;
}

function persistTokensInResponse(
  response: NextResponse,
  tokens: NormalizedAuthTokens,
  payload: AccessTokenPayload,
): void {
  const secure = process.env.NODE_ENV === 'production';
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = payload.exp ? Math.max(payload.exp - nowSeconds, 0) : 15 * 60;

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: tokens.refreshToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: ENV.refreshTokenMaxAgeSeconds,
  });
}

function clearAuthCookiesFromResponse(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
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
