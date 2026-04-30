/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CountriesResponse,
  CountrySort,
  CountryStatusFilter,
} from '@/_types/country';
import { mapCountry, mapMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CountrySort;
  status?: CountryStatusFilter;
}): CountriesResponse {
  return {
    data: [],
    metadata: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filters,
    },
  };
}

export async function getAdminCountries(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CountrySort;
    status?: CountryStatusFilter;
  }> = {},
): Promise<CountriesResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
  } = query;
  const filters = { sort, status };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COUNTRIES_ADMIN, {
      params,
    });

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return {
        ...buildEmptyResponse(filters),
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid countries response.',
          error: 'The countries list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCountry),
      metadata: raw.metadata
        ? mapMetadata(raw.metadata)
        : buildEmptyResponse(filters).metadata,
    };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      ...buildEmptyResponse(filters),
      error: normalized.data,
    };
  }
}

export const getCountries = getAdminCountries;
