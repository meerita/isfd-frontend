/** @format */

'use server';

// File: src/_actions/user/updateUserPrivacy.ts
// Purpose: Update user privacy settings through PATCH by UUID for superadmins
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { UserActionState } from '@/_types/user';

export type UserPrivacySettingsPayload = Readonly<{
  pro: Readonly<{
    invisible: boolean;
    hideActivity: boolean;
  }>;
  general: Readonly<{
    hiddenInSearch: boolean;
    hideMyGroups: boolean;
  }>;
  cookies: Readonly<{
    analytics: boolean;
    marketing: boolean;
    other: boolean;
  }>;
}>;

type UpdateUserPrivacyPayload = Readonly<{
  uuid: string;
  username?: string | null;
  privacy: UserPrivacySettingsPayload;
}>;

export async function updateUserPrivacy(
  payload: UpdateUserPrivacyPayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing user identifier to update privacy.',
        error: 'USER_UUID_REQUIRED',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.USER_BY_UUID(normalizedUuid),
      {
        settings: {
          privacy: payload.privacy,
        },
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
