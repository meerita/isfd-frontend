/** @format */

// File: src/_actions/flags/getFeatureFlags.ts
// Purpose: List all feature flags
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use server';
import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { FeatureFlag } from '@/_types/featureFlag';

export async function getFeatureFlags(): Promise<ReadonlyArray<FeatureFlag>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<ReadonlyArray<FeatureFlag>>(
      API_ROUTES.FEATURE_FLAGS_ADMIN,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return data;
  } catch (error) {
    console.error('Failed to fetch feature flags', error);
    return [];
  }
}
