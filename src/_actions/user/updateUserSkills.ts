/** @format */

'use server';

// File: src/_actions/user/updateUserSkills.ts
// Purpose: Update user profile skills through PATCH by UUID for superadmins
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { UserActionState, UserSkill } from '@/_types/user';

type UpdateUserSkillsPayload = Readonly<{
  uuid: string;
  username?: string | null;
  skills: ReadonlyArray<UserSkill>;
}>;

export async function updateUserSkills(
  payload: UpdateUserSkillsPayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing user identifier to update skills.',
        error: 'USER_UUID_REQUIRED',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.USER_BY_UUID(normalizedUuid),
      {
        profile: {
          skills: payload.skills,
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
