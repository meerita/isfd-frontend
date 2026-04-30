/** @format */

'use server';

// File: src/_actions/country/toggleCountryActivation.ts
// Purpose: Toggle activation status of a country via the admin API
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CountryActionState } from '@/_types/country';

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const getBooleanValue = (formData: FormData, key: string): boolean => {
  const value = formData.get(key);
  if (typeof value !== 'string') return false;
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
};

const FORM_ERROR_RESPONSE: CountryActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing country identifier.',
    error: 'Country identifier is required to toggle activation.',
  },
};

export async function toggleCountryActivation(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const countryId = getStringValue(formData, 'countryId') || null;

  if (!countryId) {
    return FORM_ERROR_RESPONSE;
  }

  const is_active = getBooleanValue(formData, 'isActive');
  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.COUNTRY_ADMIN_ACTIVATION(countryId), {
      is_active,
    });
    revalidatePath(NAVIGATION.COUNTRIES);
    revalidatePath(NAVIGATION.COUNTRY_BY_ID(countryId));
    return { status: 'success' } satisfies CountryActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies CountryActionState;
  }
}
