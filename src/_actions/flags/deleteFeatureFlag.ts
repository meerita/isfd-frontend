/** @format */

// File: src/_actions/flags/deleteFeatureFlag.ts
// Purpose: Delete feature flag
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use server';
import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';

export async function deleteFeatureFlag(id: string): Promise<void> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.delete(API_ROUTES.FEATURE_FLAG_ADMIN_BY_ID(id), {
      headers,
    });

    revalidatePath(NAVIGATION.FLAGS);
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    throw error;
  }
}
