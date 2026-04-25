/** @format */

'use server';

// File: src/_actions/user/updateUserLegal.ts
// Purpose: Update user legal flags (first timer, terms, etc.) via PATCH using UUID
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { User, UserActionState } from '@/_types/user';

export type UserLegalPayload = NonNullable<User['legal']>;

type UpdateUserLegalPayload = Readonly<{
  uuid: string;
  username?: string | null;
  legal: Readonly<Partial<UserLegalPayload>>;
}>;

export async function updateUserLegal(
  payload: UpdateUserLegalPayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing user identifier to update legal flags.',
        error: 'USER_UUID_REQUIRED',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.USER_BY_UUID(normalizedUuid),
      {
        legal: payload.legal,
      },
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
