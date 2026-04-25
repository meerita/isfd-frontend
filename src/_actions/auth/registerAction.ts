/** @format */

'use server';

// File: src/_actions/auth/registerAction.ts
// Purpose: Register a new user via 2-step OTP flow. No session is created on registration.
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { redirect } from 'next/navigation';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import type {
  RegisterActionState,
  StartRegistrationResponse,
} from '@/_types/auth';

const FORM_ERROR_RESPONSE: RegisterActionState = {
  status: 'error',
  step: 'credentials',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing required fields.',
    error: 'Please enter email and password.',
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

export async function registerAction(
  prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const code = getStringValue(formData, 'code');

  // Step 2: verify registration OTP
  if (code) {
    const challengeId = getStringValue(formData, 'challenge_id');

    if (!challengeId) {
      return {
        status: 'error',
        step: 'otp',
        challengeId: prevState.challengeId,
        email: prevState.email,
        otpCode: prevState.otpCode,
        otpExpiresAt: prevState.otpExpiresAt,
        error: {
          reason: 'FORM_VALIDATION_ERROR',
          message: 'Missing challenge ID.',
          error: 'Session data lost. Please start registration again.',
        },
      } satisfies RegisterActionState;
    }

    try {
      await api.post(API_ROUTES.AUTH_REGISTER_VERIFY_OTP, {
        challenge_id: challengeId,
        code,
      });

      // Registration complete — no tokens are returned. Redirect to login.
      redirect('/');
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
        email: prevState.email,
        otpCode: prevState.otpCode,
        otpExpiresAt: prevState.otpExpiresAt,
        error: normalized.data,
      } satisfies RegisterActionState;
    }
  }

  // Step 1: submit registration credentials
  const email = getStringValue(formData, 'email');
  const password = getStringValue(formData, 'password');
  const username = getStringValue(formData, 'username') || undefined;

  if (!email || !password) {
    return FORM_ERROR_RESPONSE;
  }

  try {
    const { data } = await api.post<StartRegistrationResponse>(
      API_ROUTES.AUTH_REGISTER,
      { email, password, username },
    );

    return {
      status: 'awaiting_otp',
      step: 'otp',
      email,
      challengeId: data.otp_challenge_id,
      otpCode: data.otp_code,
      otpExpiresAt: data.otp_expires_at,
    } satisfies RegisterActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      step: 'credentials',
      error: normalized.data,
    } satisfies RegisterActionState;
  }
}
