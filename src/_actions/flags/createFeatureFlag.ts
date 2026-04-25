/** @format */

// File: src/_actions/flags/createFeatureFlag.ts
// Purpose: Create a new feature flag
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use server';
import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { FeatureFlagCreateDTO, FeatureFlag } from '@/_types/featureFlag';

export async function createFeatureFlag(
  payload: FeatureFlagCreateDTO,
): Promise<FeatureFlag> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.post<FeatureFlag>(
      API_ROUTES.FEATURE_FLAGS_ADMIN,
      payload,
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.FLAGS);

    return data;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    throw error;
  }
}
