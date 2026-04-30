/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { Country, CountryDetailResponse } from '@/_types/country';
import { mapCountry } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.country) && typeof payload.country.id === 'string') return payload.country;
  return null;
}

export async function getAdminCountryById(
  countryId: string,
): Promise<CountryDetailResponse> {
  if (!countryId) {
    return {
      data: null,
      error: {
        reason: 'COUNTRY_ID_REQUIRED',
        message: 'Missing country identifier.',
        error: 'Country identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COUNTRY_ADMIN_BY_ID(countryId));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid country response.',
          error: 'The country detail response was not valid.',
        },
      };
    }

    return { data: mapCountry(raw) };
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

export async function getCountryById(countryId: string): Promise<Country | null> {
  const response = await getAdminCountryById(countryId);
  return response.data;
}
