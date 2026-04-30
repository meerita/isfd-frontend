/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { City, CityDetailResponse } from '@/_types/city';
import { mapCity } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.city) && typeof payload.city.id === 'string') return payload.city;
  return null;
}

export async function getAdminCityById(cityId: string): Promise<CityDetailResponse> {
  if (!cityId) {
    return {
      data: null,
      error: {
        reason: 'CITY_ID_REQUIRED',
        message: 'Missing city identifier.',
        error: 'City identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.CITY_ADMIN_BY_ID(cityId));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid city response.',
          error: 'The city detail response was not valid.',
        },
      };
    }

    return { data: mapCity(raw) };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return {
      data: null,
      error: normalized.data,
    };
  }
}

export async function getCityById(cityId: string): Promise<City | null> {
  const response = await getAdminCityById(cityId);
  return response.data;
}
