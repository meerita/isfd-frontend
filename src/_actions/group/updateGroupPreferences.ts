/** @format */

'use server';

// File: src/_actions/group/updateGroupPreferences.ts
// Purpose: Update editable group preference fields through PATCH by id
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { GroupActionState, GroupPreferences, GroupStatus } from '@/_types/group';

type UpdateGroupPreferencesPayload = Readonly<{
  groupId: string;
  preferences: GroupPreferences;
  status?: GroupStatus;
}>;

export async function updateGroupPreferences(
  payload: UpdateGroupPreferencesPayload,
): Promise<GroupActionState> {
  const normalizedGroupId = payload.groupId.trim();

  if (!normalizedGroupId) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing group identifier to update preferences.',
        error: 'GROUP_ID_REQUIRED',
      },
    } satisfies GroupActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.GROUP_BY_ID(normalizedGroupId),
      {
        preferences: payload.preferences,
        ...(payload.status ? { status: payload.status } : {}),
      },
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.GROUPS);
    revalidatePath(NAVIGATION.GROUP_BY_ID(normalizedGroupId));

    return { status: 'success' } satisfies GroupActionState;
  } catch (error: unknown) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies GroupActionState;
  }
}
