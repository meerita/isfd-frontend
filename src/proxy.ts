/** @format */
/**
 * @file src/proxy.ts
 * @description Enforces session-based access control and request locale persistence through Next.js proxy.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import ENV from '@/_constants/env';
import {
  BROWSER_LANGUAGE_IS_ENABLED,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  localeIsSupported,
  type AppLocale,
} from '@/_i18n/config';
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

type RefreshResult = Readonly<{
  session: NormalizedSession;
  payload: AccessTokenPayload;
}>;

type AuthResolution = Readonly<{
  payload: AccessTokenPayload | null;
  sessionToPersist: NormalizedSession | null;
  shouldClearCookies: boolean;
}>;

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const normalizedPath = normalizePathname(request.nextUrl.pathname);

  if (shouldBypass(normalizedPath)) {
    return NextResponse.next();
  }

  const locale = resolveLocaleFromRequest(request);
  const pathIsPublic = isPublicPath(normalizedPath);
  const authIsRequired = !pathIsPublic;

  const authResolution = await resolveRequestAuthState(request);

  if (authIsRequired && authPayloadIsMissingOrExpired(authResolution.payload)) {
    return createRedirectResponse(request, locale, true);
  }

  if (
    pathIsPublic &&
    normalizedPath === '/' &&
    authPayloadIsActive(authResolution.payload)
  ) {
    return createResponseWithUpdates(
      NextResponse.redirect(new URL('/dashboard', request.url)),
      locale,
      authResolution,
    );
  }

  return createResponseWithUpdates(NextResponse.next(), locale, authResolution);
}

async function resolveRequestAuthState(
  request: NextRequest,
): Promise<AuthResolution> {
  const tokenValue = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  let payload = decodeAccessToken(tokenValue);
  let sessionToPersist: NormalizedSession | null = null;
  let shouldClearCookies = false;

  if (!payload || shouldRefreshAccessToken(payload)) {
    const refreshedSession = await tryRefreshSession(request);

    if (refreshedSession) {
      payload = refreshedSession.payload;
      sessionToPersist = refreshedSession.session;
    } else if (!payload || isTokenExpired(payload)) {
      payload = null;
      shouldClearCookies = true;
    }
  }

  return {
    payload,
    sessionToPersist,
    shouldClearCookies,
  };
}

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

  return { session, payload };
}

function createResponseWithUpdates(
  response: NextResponse,
  locale: AppLocale,
  authResolution: AuthResolution,
): NextResponse {
  persistLocaleCookie(response, locale);

  if (authResolution.sessionToPersist && authResolution.payload) {
    persistSessionInResponse(response, authResolution.sessionToPersist);
    return response;
  }

  if (authResolution.shouldClearCookies) {
    clearAuthCookiesFromResponse(response);
  }

  return response;
}

function createRedirectResponse(
  request: NextRequest,
  locale: AppLocale,
  shouldClearAuthCookies: boolean,
): NextResponse {
  const response = NextResponse.redirect(new URL('/', request.url));

  persistLocaleCookie(response, locale);

  if (shouldClearAuthCookies) {
    clearAuthCookiesFromResponse(response);
  }

  return response;
}

function persistSessionInResponse(
  response: NextResponse,
  session: NormalizedSession,
): void {
  const secure = process.env.NODE_ENV === 'production';
  const accessTokenMaxAge = getRemainingMaxAgeInSeconds(
    session.accessTokenExpiresAt,
  );
  const refreshTokenMaxAge = getRemainingMaxAgeInSeconds(
    session.refreshTokenExpiresAt,
  );

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

function persistLocaleCookie(response: NextResponse, locale: AppLocale): void {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });
}

function clearAuthCookiesFromResponse(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(SESSION_ID_COOKIE);
}

function resolveLocaleFromRequest(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (localeIsSupported(cookieLocale)) {
    return cookieLocale;
  }

  if (!BROWSER_LANGUAGE_IS_ENABLED) {
    return DEFAULT_LOCALE;
  }

  const acceptLanguageHeader = request.headers.get('accept-language');

  if (!acceptLanguageHeader) {
    return DEFAULT_LOCALE;
  }

  const preferredLocales = acceptLanguageHeader.split(',');

  for (const preferredLocale of preferredLocales) {
    const normalizedLocale = preferredLocale
      .split(';')[0]
      ?.trim()
      .toLowerCase();

    if (!normalizedLocale) {
      continue;
    }

    const baseLocale = normalizedLocale.split('-')[0];

    if (localeIsSupported(baseLocale)) {
      return baseLocale;
    }
  }

  return DEFAULT_LOCALE;
}

function authPayloadIsMissingOrExpired(
  payload: AccessTokenPayload | null,
): boolean {
  if (!payload) {
    return true;
  }

  return isTokenExpired(payload);
}

function authPayloadIsActive(payload: AccessTokenPayload | null): boolean {
  if (!payload) {
    return false;
  }

  return !isTokenExpired(payload);
}

function getRemainingMaxAgeInSeconds(isoString: string): number {
  const expiresAt = new Date(isoString).getTime();
  return Math.max(Math.floor((expiresAt - Date.now()) / 1000), 0);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function shouldBypass(pathname: string): boolean {
  for (const prefix of IGNORED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

function normalizePathname(pathname: string): string {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/$/, '') || '/';
}
