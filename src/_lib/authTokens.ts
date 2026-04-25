/** @format */

// File: src/_lib/authTokens.ts
// Purpose: Helper utilities to manage auth cookies and token decoding for ISFD backend
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import ENV from '@/_constants/env';
import type {
  AccessTokenPayload,
  NormalizedSession,
  RefreshSessionResponse,
  VerifyLoginOtpResponse,
} from '@/_types/auth';

export const ACCESS_TOKEN_COOKIE = 'isfd-access-token';
export const REFRESH_TOKEN_COOKIE = 'isfd-refresh-token';
export const SESSION_ID_COOKIE = 'isfd-session-id';
export const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60;

export function decodeAccessToken(
  tokenValue?: string | null,
): AccessTokenPayload | null {
  if (!tokenValue) {
    return null;
  }

  const decoded = jwt.decode(tokenValue);

  if (!decoded || typeof decoded === 'string') {
    return null;
  }

  return decoded as AccessTokenPayload;
}

export function isTokenExpired(payload: AccessTokenPayload | null): boolean {
  if (!payload?.exp) {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

export function shouldRefreshAccessToken(
  payload: AccessTokenPayload | null,
): boolean {
  if (!payload?.exp) {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp - nowSeconds <= ACCESS_TOKEN_REFRESH_BUFFER_SECONDS;
}

export function normalizeSession(
  response: VerifyLoginOtpResponse,
): NormalizedSession {
  return {
    sessionId: response.session_id,
    accessToken: response.access_token,
    accessTokenExpiresAt: response.access_token_expires_at,
    refreshToken: response.refresh_token,
    refreshTokenExpiresAt: response.refresh_token_expires_at,
  };
}

function isoToMaxAge(isoString: string): number {
  const expiresAt = new Date(isoString).getTime();
  const nowMs = Date.now();
  return Math.max(Math.floor((expiresAt - nowMs) / 1000), 0);
}

export async function persistSession(session: NormalizedSession): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const payload = decodeAccessToken(session.accessToken);
  const secure = process.env.NODE_ENV === 'production';

  if (!payload) {
    return null;
  }

  const accessTokenMaxAge = isoToMaxAge(session.accessTokenExpiresAt);
  const refreshTokenMaxAge = isoToMaxAge(session.refreshTokenExpiresAt);

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: accessTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });

  cookieStore.set(SESSION_ID_COOKIE, session.sessionId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenMaxAge || ENV.refreshTokenMaxAgeSeconds,
  });

  return payload;
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(SESSION_ID_COOKIE);
}

export async function getAccessTokenPayloadFromCookies(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  return decodeAccessToken(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
}

export async function refreshAuthSession(
  sessionId: string,
  refreshToken: string,
): Promise<NormalizedSession | null> {
  try {
    const response = await fetch(`${ENV.apiBaseUrl}${API_ROUTES.AUTH_REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, refresh_token: refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Refresh token request failed', response.status);
      return null;
    }

    const data = (await response.json()) as RefreshSessionResponse;
    return normalizeSession(data);
  } catch (error) {
    console.error('Failed to refresh session', error);
    return null;
  }
}

export async function getAuthenticatedRequestHeaders(options?: {
  refreshIfNeeded?: boolean;
}): Promise<Record<string, string> | undefined> {
  const refreshIfNeeded = options?.refreshIfNeeded ?? false;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const payload = decodeAccessToken(accessToken);

  if (accessToken && payload && !isTokenExpired(payload)) {
    if (!refreshIfNeeded || !shouldRefreshAccessToken(payload)) {
      return { Authorization: `Bearer ${accessToken}` };
    }
  }

  if (!refreshIfNeeded) {
    return undefined;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
  const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value ?? null;

  if (!refreshToken || !sessionId) {
    if (!payload || isTokenExpired(payload)) {
      await clearAuthCookies();
      return undefined;
    }

    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }

  const refreshedSession = await refreshAuthSession(sessionId, refreshToken);

  if (!refreshedSession) {
    if (!payload || isTokenExpired(payload)) {
      await clearAuthCookies();
      return undefined;
    }

    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }

  const refreshedPayload = await persistSession(refreshedSession);

  if (!refreshedPayload || isTokenExpired(refreshedPayload)) {
    await clearAuthCookies();
    return undefined;
  }

  return { Authorization: `Bearer ${refreshedSession.accessToken}` };
}
