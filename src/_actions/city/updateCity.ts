/** @format */

'use server';

// File: src/_actions/city/updateCity.ts
// Purpose: Update city records via PATCH wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import type { City, CityActionState } from '@/_types/city';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';

type UpdateCityPayload = Readonly<{
  cityId: City['id'] | null;
  name: string;
  countryCode: string;
  country?: string;
  continent: City['continent'];
  province?: string;
  capital: boolean;
  coordinates: Readonly<{ lat: number | null; lng: number | null }>;
}>;

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const getOptionalStringValue = (
  formData: FormData,
  key: string,
): string | undefined => {
  const value = getStringValue(formData, key);
  return value.length > 0 ? value : undefined;
};

const normalizeNumericInput = (rawValue: string): string =>
  rawValue
    .trim()
    .replaceAll(/\s+/g, '')
    .replaceAll('\u2212', '-')
    .replaceAll(',', '.');

const getNumberValue = (formData: FormData, key: string): number | null => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = normalizeNumericInput(value);
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
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

const buildPayload = (formData: FormData): UpdateCityPayload => ({
  cityId: getStringValue(formData, 'cityId') || null,
  name: getStringValue(formData, 'name'),
  countryCode: getStringValue(formData, 'countryCode'),
  country: getOptionalStringValue(formData, 'countryName'),
  continent: getStringValue(formData, 'continent') as City['continent'],
  province: getOptionalStringValue(formData, 'province'),
  capital: getBooleanValue(formData, 'capital'),
  coordinates: {
    lat: getNumberValue(formData, 'latitude'),
    lng: getNumberValue(formData, 'longitude'),
  },
});

const buildRequestBody = (
  payload: UpdateCityPayload,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    name: payload.name,
    countryCode: payload.countryCode,
    continent: payload.continent,
    capital: payload.capital,
  };

  if (payload.country) {
    body.country = payload.country;
  }

  if (payload.province) {
    body.province = payload.province;
  }

  const { lat, lng } = payload.coordinates;
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.coordinates = { lat, lng };
  }

  return body;
};

const FORM_ERROR_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing city identifier.',
    error: 'City identifier is required to update the record.',
  },
};

export async function updateCity(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const payload = buildPayload(formData);
  const { cityId } = payload;

  if (!cityId) {
    return FORM_ERROR_RESPONSE;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
  const body = buildRequestBody(payload);

  try {
    await api.patch(API_ROUTES.CITY_BY_ID(cityId), body, {
      headers,
    });

    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));

    return { status: 'success' } satisfies CityActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies CityActionState;
  }
}
