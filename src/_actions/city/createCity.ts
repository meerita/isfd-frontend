/** @format */

'use server';

// File: src/_actions/city/createCity.ts
// Purpose: Create a city via the admin API
// Author: Diego M. Lafuente

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CityActionState } from '@/_types/city';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function raw(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== 'string') return null;
  return v === '' ? null : v;
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

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

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

const INVALID_COUNTRY_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'CITY_COUNTRY_ID_INVALID',
    message: 'Country identifier is invalid.',
    error: 'field "country_id" must be a valid UUID',
  },
};

export async function createCity(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const country_id = str(formData, 'countryId');
  if (!country_id) return MISSING_COUNTRY_RESPONSE;
  if (!isValidUuid(country_id)) return INVALID_COUNTRY_RESPONSE;

  const province_name = raw(formData, 'provinceName');
  const name = str(formData, 'name');
  if (!name) return MISSING_NAME_RESPONSE;

  const region_name = str(formData, 'regionName') || null;
  const latitude = num(formData, 'latitude');
  const longitude = num(formData, 'longitude');
  const is_active = formData.get('isActive') === 'true';

  const body = {
    country_id,
    name,
    province_name,
    region_name,
    latitude,
    longitude,
    is_active,
  };

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.post(API_ROUTES.CITIES_ADMIN, body, { headers });
    revalidatePath(NAVIGATION.CITIES);
    return { status: 'success' } satisfies CityActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CityActionState;
  }
}
