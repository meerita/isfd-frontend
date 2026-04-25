/** @format */

// File: src/_lib/authTokens.ts
// Purpose: Helper utilities to manage auth cookies and token decoding
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import ENV from '@/_constants/env';
import type {
  AccessTokenPayload,
  AuthTokensResponse,
  NormalizedAuthTokens,
} from '@/_types/auth';

export const ACCESS_TOKEN_COOKIE = 'sportapp-access-token';
export const REFRESH_TOKEN_COOKIE = 'sportapp-refresh-token';
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

export function normalizeAuthTokens(
  tokens: AuthTokensResponse,
): NormalizedAuthTokens | null {
  const accessToken = tokens.accessToken ?? tokens.access_token;
  const refreshToken = tokens.refreshToken ?? tokens.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  } satisfies NormalizedAuthTokens;
}

export async function persistAuthTokens(
  tokens: AuthTokensResponse,
): Promise<AccessTokenPayload | null> {
  const normalizedTokens = normalizeAuthTokens(tokens);

  if (!normalizedTokens) {
    return null;
  }

  const cookieStore = await cookies();
  const payload = decodeAccessToken(normalizedTokens.accessToken);
  const secure = process.env.NODE_ENV === 'production';

  if (!payload) {
    return null;
  }

  const maxAge = payload.exp
    ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0)
    : 15 * 60;

  cookieStore.set(ACCESS_TOKEN_COOKIE, normalizedTokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, normalizedTokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ENV.refreshTokenMaxAgeSeconds,
  });

  return payload;
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessTokenPayloadFromCookies(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  return decodeAccessToken(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
}

export async function refreshAuthSession(
  refreshToken: string,
): Promise<NormalizedAuthTokens | null> {
  try {
    const response = await fetch(`${ENV.apiBaseUrl}${API_ROUTES.REFRESH_SESSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Refresh token request failed', response.status);
      return null;
    }

    const tokens = (await response.json()) as AuthTokensResponse;
    return normalizeAuthTokens(tokens);
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

  if (!refreshToken) {
    if (!payload || isTokenExpired(payload)) {
      await clearAuthCookies();
      return undefined;
    }

    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }

  const refreshedTokens = await refreshAuthSession(refreshToken);

  if (!refreshedTokens) {
    if (!payload || isTokenExpired(payload)) {
      await clearAuthCookies();
      return undefined;
    }

    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }

  const refreshedPayload = await persistAuthTokens(refreshedTokens);

  if (!refreshedPayload || isTokenExpired(refreshedPayload)) {
    await clearAuthCookies();
    return undefined;
  }

  return { Authorization: `Bearer ${refreshedTokens.accessToken}` };
}
