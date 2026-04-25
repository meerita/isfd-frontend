/** @format */

// File: src/_actions/flags/updateFeatureFlag.ts
// Purpose: Update feature flag
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use server';
import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { FeatureFlagUpdateDTO, FeatureFlag } from '@/_types/featureFlag';

export async function updateFeatureFlag(
  id: string,
  payload: FeatureFlagUpdateDTO,
): Promise<FeatureFlag> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.patch<FeatureFlag>(
      API_ROUTES.FEATURE_FLAG_ADMIN_BY_ID(id),
      payload,
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.FLAGS);
    revalidatePath(NAVIGATION.FLAGS + `/${id}`);

    return data;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    throw error;
  }
}
