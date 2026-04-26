/** @format */

'use server';

// File: src/_actions/city/updateCity.ts
// Purpose: Update a city via the admin API (partial PATCH)

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CityActionState } from '@/_types/city';

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeNumericInput(raw: string): string {
  return raw.trim().replaceAll(/\s+/g, '').replaceAll('\u2212', '-').replaceAll(',', '.');
}

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (typeof v !== 'string') return null;
  const normalized = normalizeNumericInput(v);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const MISSING_ID_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing city identifier.',
    error: 'City identifier is required to update the record.',
  },
};

const MISSING_COUNTRY_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'CITY_COUNTRY_ID_REQUIRED',
    message: 'Country is required.',
    error: 'field "country_id" cannot be null',
  },
};

const MISSING_NAME_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'CITY_NAME_REQUIRED',
    message: 'City name is required.',
    error: 'field "name" cannot be null',
  },
};

export async function updateCity(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const cityId = str(formData, 'cityId');
  if (!cityId) return MISSING_ID_RESPONSE;

  const country_id = str(formData, 'countryId');
  if (!country_id) return MISSING_COUNTRY_RESPONSE;

  const name = str(formData, 'name');
  if (!name) return MISSING_NAME_RESPONSE;

  const region_name = str(formData, 'regionName') || null;
  const province_name = str(formData, 'provinceName') || null;
  const latitude = num(formData, 'latitude');
  const longitude = num(formData, 'longitude');
  const is_active = formData.get('isActive') === 'true';

  const body: Record<string, unknown> = {
    country_id,
    name,
    region_name,
    province_name,
    latitude,
    longitude,
    is_active,
  };

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(API_ROUTES.CITY_ADMIN_BY_ID(cityId), body, { headers });
    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));
    return { status: 'success' } satisfies CityActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CityActionState;
  }
}
