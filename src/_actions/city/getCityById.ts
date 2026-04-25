/** @format */

'use server';

// File: src/_actions/city/getCityById.ts
// Purpose: Fetch a single city by id reusing auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { City } from '@/_types/city';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCity = (value: unknown): value is City => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.countryCode === 'string'
  );
};

const normalizeCity = (payload: unknown): City | null => {
  if (isCity(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (isCity(payload.data)) {
      return payload.data;
    }

    if (isCity(payload.city)) {
      return payload.city;
    }
  }

  return null;
};

export async function getCityById(cityId: string): Promise<City | null> {
  if (!cityId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.CITY_BY_ID(cityId), {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return normalizeCity(data);
  } catch (error) {
    const normalized = normalizeApiError(error);

    if (normalized.statusCode === 404) {
      return null;
    }

    logApiError(normalized);
    return null;
  }
}
