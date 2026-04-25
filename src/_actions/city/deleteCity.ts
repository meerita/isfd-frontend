/** @format */

'use server';
// File: src/_actions/city/deleteCity.ts
// Purpose: Delete city records via DELETE wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';

type DeleteCityResult = Readonly<{
  success: boolean;
  error?: string;
}>;

export async function deleteCity(cityId: string): Promise<DeleteCityResult> {
  if (!cityId) {
    return {
      success: false,
      error: 'Missing city identifier.',
    } satisfies DeleteCityResult;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.delete(API_ROUTES.CITY_BY_ID(cityId), {
      headers,
    });

    revalidatePath(NAVIGATION.CITIES);

    return { success: true } satisfies DeleteCityResult;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      success: false,
      error:
        normalized.data.error ??
        normalized.data.message ??
        'We could not delete this city.',
    } satisfies DeleteCityResult;
  }
}
