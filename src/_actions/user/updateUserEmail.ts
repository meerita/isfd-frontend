/** @format */

'use server';

// File: src/_actions/user/updateUserEmail.ts
// Purpose: Request an email change for a user and retrieve the verification payload
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { ApiErrorResponse } from '@/_types/api';

export type EmailVerificationResponse = Readonly<{
  verificationCode: string;
  expiresAt: string;
}>;

type UpdateUserEmailPayload = Readonly<{
  uuid: string;
  username?: string | null;
  email: string;
}>;

export type UpdateUserEmailResult =
  | Readonly<{
      status: 'success';
      data: EmailVerificationResponse;
    }>
  | Readonly<{
      status: 'error';
      error: ApiErrorResponse;
    }>;

export async function updateUserEmail(
  payload: UpdateUserEmailPayload,
): Promise<UpdateUserEmailResult> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedEmail = payload.email.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid || !normalizedEmail) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'User identifier and email are required to continue.',
        error: 'USER_EMAIL_REQUIRED',
      },
    } satisfies UpdateUserEmailResult;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.patch<EmailVerificationResponse>(
      API_ROUTES.USER_EMAIL(normalizedUuid),
      { email: normalizedEmail },
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.USERS);
    if (normalizedUsername) {
      revalidatePath(NAVIGATION.USER_BY_USERNAME(normalizedUsername));
    }

    return {
      status: 'success',
      data: data ?? { verificationCode: '', expiresAt: '' },
    } satisfies UpdateUserEmailResult;
  } catch (error: unknown) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies UpdateUserEmailResult;
  }
}
