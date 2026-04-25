/** @format */

'use server';

// File: src/_actions/auth/loginWithEmail.ts
// Purpose: Authenticate user against the ISFD backend using the 2-step OTP login flow
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { redirect } from 'next/navigation';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import {
  clearAuthCookies,
  getAuthenticatedRequestHeaders,
  normalizeSession,
  persistSession,
} from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { NormalizedApiError } from '@/_types/api';
import type {
  AuthUser,
  LoginActionState,
  StartLoginResponse,
  VerifyLoginOtpResponse,
} from '@/_types/auth';

const FORM_ERROR_RESPONSE: LoginActionState = {
  status: 'error',
  step: 'credentials',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing credentials',
    error: 'Please enter both email and password.',
  },
};

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function isNextRedirectError(
  error: unknown,
): error is Error & { digest: string } {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}

export async function loginWithEmail(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const code = getStringValue(formData, 'code');

  // Step 2: verify OTP
  if (code) {
    const challengeId = getStringValue(formData, 'challenge_id');
    const deviceId = getStringValue(formData, 'device_id');

    if (!challengeId) {
      return {
        status: 'error',
        step: 'otp',
        challengeId: prevState.challengeId,
        otpCode: prevState.otpCode,
        otpExpiresAt: prevState.otpExpiresAt,
        error: {
          reason: 'FORM_VALIDATION_ERROR',
          message: 'Missing challenge ID.',
          error: 'Session data lost. Please start login again.',
        },
      } satisfies LoginActionState;
    }

    try {
      const { data } = await api.post<VerifyLoginOtpResponse>(
        API_ROUTES.AUTH_LOGIN_VERIFY_OTP,
        {
          challenge_id: challengeId,
          code,
          device_id: deviceId || 'unknown-device',
        },
      );

      const session = normalizeSession(data);
      const payload = await persistSession(session);

      if (!payload) {
        const tokenError: NormalizedApiError = {
          statusCode: 500,
          data: {
            reason: 'TOKEN_PARSE_ERROR',
            message: 'Access token could not be decoded.',
            error: 'Unable to process authentication tokens.',
          },
        };

        logApiError(tokenError);

        return {
          status: 'error',
          step: 'otp',
          challengeId: prevState.challengeId,
          otpCode: prevState.otpCode,
          otpExpiresAt: prevState.otpExpiresAt,
          error: tokenError.data,
        } satisfies LoginActionState;
      }

      // Bootstrap user from /me before redirecting
      const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: false });

      if (!headers) {
        await clearAuthCookies();
        return {
          status: 'error',
          step: 'otp',
          error: {
            reason: 'AUTH_ERROR',
            message: 'Session could not be established.',
            error: 'Please try logging in again.',
          },
        } satisfies LoginActionState;
      }

      try {
        await api.get<AuthUser>(API_ROUTES.ME, { headers });
      } catch (meError) {
        await clearAuthCookies();
        const normalized = normalizeApiError(meError);
        logApiError(normalized);

        return {
          status: 'error',
          step: 'otp',
          error: {
            reason: 'AUTH_ERROR',
            message: 'Could not load user profile.',
            error: 'Login failed. Please try again.',
          },
        } satisfies LoginActionState;
      }

      redirect('/dashboard');
    } catch (error) {
      if (isNextRedirectError(error)) {
        throw error;
      }

      const normalized = normalizeApiError(error);
      logApiError(normalized);

      return {
        status: 'error',
        step: 'otp',
        challengeId: prevState.challengeId,
        otpCode: prevState.otpCode,
        otpExpiresAt: prevState.otpExpiresAt,
        error: normalized.data,
      } satisfies LoginActionState;
    }
  }

  // Step 1: submit credentials
  const email = getStringValue(formData, 'email');
  const password = getStringValue(formData, 'password');

  if (!email || !password) {
    return FORM_ERROR_RESPONSE;
  }

  try {
    const { data } = await api.post<StartLoginResponse>(API_ROUTES.AUTH_LOGIN, {
      email,
      password,
    });

    return {
      status: 'awaiting_otp',
      step: 'otp',
      challengeId: data.otp_challenge_id,
      otpCode: data.otp_code,
      otpExpiresAt: data.otp_expires_at,
    } satisfies LoginActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      step: 'credentials',
      error: normalized.data,
    } satisfies LoginActionState;
  }
}
