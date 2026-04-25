/** @format */

// File: src/_actions/flags/getFeatureFlagById.ts
// Purpose: Get feature flag by ID
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use server';
import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { FeatureFlag } from '@/_types/featureFlag';

export async function getFeatureFlagById(
  id: string,
): Promise<FeatureFlag | null> {
  if (!id) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<FeatureFlag>(
      API_ROUTES.FEATURE_FLAG_ADMIN_BY_ID(id),
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return data;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return null;
  }
}
