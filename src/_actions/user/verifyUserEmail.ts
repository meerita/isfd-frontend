/** @format */

'use server';

// File: src/_actions/user/verifyUserEmail.ts
// Purpose: Confirm a user email change via verification code
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { UserActionState } from '@/_types/user';

type VerifyUserEmailPayload = Readonly<{
  uuid: string;
  username?: string | null;
  code: string;
}>;

export async function verifyUserEmail(
  payload: VerifyUserEmailPayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedCode = payload.code.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid || !normalizedCode) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Verification code and user identifier are required.',
        error: 'USER_EMAIL_VERIFICATION_REQUIRED',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.post(
      API_ROUTES.USER_EMAIL_VERIFY(normalizedUuid),
      { code: normalizedCode },
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.USERS);
    if (normalizedUsername) {
      revalidatePath(NAVIGATION.USER_BY_USERNAME(normalizedUsername));
    }

    return { status: 'success' } satisfies UserActionState;
  } catch (error: unknown) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies UserActionState;
  }
}
