/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CountryActionState } from '@/_types/country';
import { buildUpdateCountryBody } from './payload';

export async function updateCountry(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const { body, error, countryId } = buildUpdateCountryBody(formData);
  if (error || !countryId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COUNTRY_ID_REQUIRED',
          message: 'Missing country identifier.',
          error: 'Country identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      countryId,
    } satisfies CountryActionState;
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.COUNTRY_ADMIN_BY_ID(countryId), body);
    revalidatePath(NAVIGATION.COUNTRIES);
    revalidatePath(NAVIGATION.COUNTRY_BY_ID(countryId));

    return {
      status: 'success',
      countryId,
    } satisfies CountryActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CountryActionState;
  }
}
