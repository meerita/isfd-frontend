/** @format */

'use server';

// File: src/_actions/user/updateUserByUsername.ts
// Purpose: Update a user by username via PATCH using shared axios/auth helpers
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { User, UserActionState } from '@/_types/user';

export async function updateUserByUsername(
  username: string,
  payload: Partial<User>,
): Promise<UserActionState> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing username.',
        error: 'Username is required to update the user.',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(API_ROUTES.USER_BY_USERNAME, payload, {
      params: { value: normalizedUsername },
      headers,
    });

    revalidatePath(NAVIGATION.USERS);
    revalidatePath(NAVIGATION.USER_BY_USERNAME(normalizedUsername));

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
