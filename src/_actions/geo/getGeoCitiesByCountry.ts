/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import type { ApiErrorResponse } from '@/_types/api';
import type { City } from '@/_types/city';
import { mapCity } from '@/_actions/city/mappers';

const GEO_CITIES_PAGE_SIZE = 100;

export type GeoCitiesResponse = Readonly<{
  data: ReadonlyArray<City>;
  error?: ApiErrorResponse;
}>;

export async function getGeoCitiesByCountry(
  countryId: string,
): Promise<GeoCitiesResponse> {
  if (!countryId) {
    return { data: [] };
  }

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.CITIES_PUBLIC_BY_COUNTRY(countryId),
      {
        params: {
          page: 1,
          page_size: GEO_CITIES_PAGE_SIZE,
          sort: 'slug_asc',
        },
      },
    );

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return {
        data: [],
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid cities response.',
          error: 'The cities selector response was not valid.',
        },
      };
    }

    return {
      data: (data as { data: Record<string, unknown>[] }).data.map(mapCity),
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
