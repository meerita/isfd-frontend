/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CityActionState } from '@/_types/city';
import { buildUpdateCityBody } from './payload';

export async function updateCity(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const { body, error, cityId, countryId, originalCountryId } =
    buildUpdateCityBody(formData);
  if (error || !cityId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'CITY_ID_REQUIRED',
          message: 'Missing city identifier.',
          error: 'City identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      cityId,
    } satisfies CityActionState;
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.CITY_ADMIN_BY_ID(cityId), body);
    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));
    if (originalCountryId) {
      revalidatePath(NAVIGATION.COUNTRY_BY_ID(originalCountryId));
    }
    if (countryId && countryId !== originalCountryId) {
      revalidatePath(NAVIGATION.COUNTRY_BY_ID(countryId));
    }

    return {
      status: 'success',
      cityId,
    } satisfies CityActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CityActionState;
  }
}
