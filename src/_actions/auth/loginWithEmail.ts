/** @format */

'use server';

// File: src/_actions/auth/loginWithEmail.ts
// Purpose: Authenticate user credentials via API and persist secure cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { redirect } from 'next/navigation';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import { persistAuthTokens } from '@/_lib/authTokens';
import type { NormalizedApiError } from '@/_types/api';
import type {
  AuthTokensResponse,
  LoginActionState,
  LoginCodeRequestResponse,
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

export async function loginWithEmail(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = getStringValue(formData, 'email');
  const password = getStringValue(formData, 'password');
  const code = getStringValue(formData, 'code');

  if (code) {
    if (!email) {
      return {
        status: 'error',
        step: 'code',
        error: {
          reason: 'FORM_VALIDATION_ERROR',
          message: 'Missing email for verification.',
          error: 'Unable to verify the code without an email.',
        },
      } satisfies LoginActionState;
    }

    try {
      const { data } = await api.post<AuthTokensResponse>(
        API_ROUTES.LOGIN_WITH_EMAIL_VERIFY,
        {
          email,
          code,
        },
      );

      const payload = await persistAuthTokens(data);

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
          step: 'code',
          email,
          verificationCode: prevState.verificationCode,
          expiresAt: prevState.expiresAt,
          error: tokenError.data,
        } satisfies LoginActionState;
      }

      if (!payload.isAdmin) {
        redirect('/forbidden');
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
        step: 'code',
        email,
        verificationCode: prevState.verificationCode,
        expiresAt: prevState.expiresAt,
        error: normalized.data,
      } satisfies LoginActionState;
    }
  }

  if (!email || !password) {
    return FORM_ERROR_RESPONSE;
  }

  try {
    const { data } = await api.post<LoginCodeRequestResponse>(
      API_ROUTES.LOGIN_WITH_EMAIL,
      {
        email,
        password,
      },
    );

    return {
      status: 'awaiting_code',
      step: 'code',
      email,
      verificationCode: data?.verificationCode,
      expiresAt: data?.expiresAt,
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

  return { status: 'success', step: 'credentials' } satisfies LoginActionState;
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
