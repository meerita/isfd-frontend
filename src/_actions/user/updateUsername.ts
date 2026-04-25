/** @format */

'use server';

// File: src/_actions/user/updateUsername.ts
// Purpose: Update only the username field for a user identified by UUID
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { UserActionState } from '@/_types/user';

type UpdateUsernamePayload = Readonly<{
  uuid: string;
  currentUsername?: string | null;
  nextUsername: string;
}>;

export async function updateUsername(
  payload: UpdateUsernamePayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedNext = payload.nextUsername.trim();
  const normalizedCurrent = payload.currentUsername?.trim() ?? '';

  if (!normalizedUuid || !normalizedNext) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Username is required to complete the update.',
        error: 'USERNAME_REQUIRED',
      },
    } satisfies UserActionState;
  }

  if (normalizedCurrent && normalizedCurrent === normalizedNext) {
    return { status: 'success' } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.USER_BY_UUID(normalizedUuid),
      {
        identity: {
          username: normalizedNext,
        },
      },
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.USERS);
    if (normalizedCurrent) {
      revalidatePath(NAVIGATION.USER_BY_USERNAME(normalizedCurrent));
    }
    revalidatePath(NAVIGATION.USER_BY_USERNAME(normalizedNext));

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
