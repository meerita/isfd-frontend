/** @format */

'use server';

// File: src/_actions/user/updateUserProfile.ts
// Purpose: Update user identity/profile data through PATCH by UUID
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type {
  UserActionState,
  UserCoordinates,
  UserIdentity,
  UserLocation,
} from '@/_types/user';

type UpdateUserProfileIdentityPayload = Readonly<Pick<UserIdentity, 'tag'>>;

type UpdateUserProfilePayload = Readonly<{
  uuid: string;
  username?: string | null;
  identity: UpdateUserProfileIdentityPayload;
  profile: Readonly<{
    name: string;
    middlename: string;
    surname: string;
    avatar: string;
    description: string;
    characteristics: Readonly<{
      birthdate: string | null;
      weight: number;
      height: number;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
    }>;
    location: Readonly<{
      continent: UserLocation['continent'];
      country: string;
      localizedName: string;
      province: string;
      city: string;
      street: string;
      number: number;
      zip: string;
      coords: UserCoordinates | null;
    }>;
  }>;
}>;

export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserActionState> {
  const normalizedUuid = payload.uuid.trim();
  const normalizedUsername = payload.username?.trim() ?? '';

  if (!normalizedUuid) {
    return {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing user identifier to update the profile.',
        error: 'USER_UUID_REQUIRED',
      },
    } satisfies UserActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.USER_BY_UUID(normalizedUuid),
      {
        identity: payload.identity,
        profile: payload.profile,
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
