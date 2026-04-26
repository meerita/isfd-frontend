/** @format */

'use server';

// File: src/_actions/city/deleteCity.ts
// Purpose: Delete a city via the admin API

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';

type DeleteCityResult = Readonly<{ success: boolean; error?: string }>;

export async function deleteCity(cityId: string): Promise<DeleteCityResult> {
  if (!cityId) {
    return { success: false, error: 'Missing city identifier.' };
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.delete(API_ROUTES.CITY_ADMIN_BY_ID(cityId), { headers });
    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));
    return { success: true };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return {
      success: false,
      error:
        normalized.data.error ??
        normalized.data.message ??
        'We could not delete this city.',
    };
  }
}
