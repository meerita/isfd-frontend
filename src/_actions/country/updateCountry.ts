/** @format */

'use server';

// File: src/_actions/country/updateCountry.ts
// Purpose: Update an existing country via PATCH reusing auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import type { Country, CountryActionState } from '@/_types/country';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';

type UpdateCountryPayload = Readonly<
  Pick<Country, 'name' | 'continent' | 'active'> & {
    countryId: Country['id'] | null;
    coordinates: Readonly<{ lat: number | null; lng: number | null }>;
    provinces: ReadonlyArray<string>;
    countryCode?: Country['countryCode'];
  }
>;

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const getNumberValue = (formData: FormData, key: string): number | null => {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getBooleanValue = (formData: FormData, key: string): boolean => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
};

const buildPayload = (formData: FormData): UpdateCountryPayload => ({
  countryId: getStringValue(formData, 'countryId') || null,
  name: getStringValue(formData, 'name'),
  continent: getStringValue(formData, 'continent') as Country['continent'],
  countryCode: getStringValue(formData, 'countryCode') || undefined,
  active: getBooleanValue(formData, 'active'),
  coordinates: {
    lat: getNumberValue(formData, 'latitude'),
    lng: getNumberValue(formData, 'longitude'),
  },
  provinces: formData
    .getAll('provinces')
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(value => value.length > 0),
});

const buildRequestBody = (
  payload: UpdateCountryPayload,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    name: payload.name,
    continent: payload.continent,
    provinces: payload.provinces,
    active: payload.active,
  };

  if (payload.countryCode) {
    body.countryCode = payload.countryCode;
  }

  const { lat, lng } = payload.coordinates;
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.coordinates = { lat, lng };
  }

  return body;
};

const FORM_ERROR_RESPONSE: CountryActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing country identifier.',
    error: 'Country identifier is required to update the record.',
  },
};

export async function updateCountry(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const payload = buildPayload(formData);
  const { countryId } = payload;

  if (!countryId) {
    return FORM_ERROR_RESPONSE;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
  const requestBody = buildRequestBody(payload);

  console.info('[updateCountry] PATCH body', requestBody);

  try {
    await api.patch(API_ROUTES.COUNTRY_BY_ID(countryId), requestBody, {
      headers,
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
