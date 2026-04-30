/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteCityResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteCity(
  cityId: string,
  countryId?: string | null,
): Promise<DeleteCityResult> {
  if (!cityId) {
    return {
      success: false,
      reason: 'CITY_ID_REQUIRED',
      error: 'Missing city identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.CITY_ADMIN_BY_ID(cityId));
    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));
    if (countryId) {
      revalidatePath(NAVIGATION.COUNTRY_BY_ID(countryId));
    }
    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      success: false,
      reason: normalized.data.reason,
      error:
        normalized.data.error ??
        normalized.data.message ??
        'We could not delete this city.',
    };
  }
}
