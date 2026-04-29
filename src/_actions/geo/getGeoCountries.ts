/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import type { ApiErrorResponse } from '@/_types/api';
import type { Country } from '@/_types/country';
import { mapCountry } from '@/_actions/country/mappers';

export type GeoCountriesResponse = Readonly<{
  data: ReadonlyArray<Country>;
  error?: ApiErrorResponse;
}>;

export async function getGeoCountries(): Promise<GeoCountriesResponse> {
  try {
    const { data } = await api.get<unknown>(API_ROUTES.COUNTRIES_ALL);

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return {
        data: [],
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid countries response.',
          error: 'The countries selector response was not valid.',
        },
      };
    }

    return {
      data: (data as { data: Record<string, unknown>[] }).data.map(mapCountry),
    };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      data: [],
      error: normalized.data,
    };
  }
}
