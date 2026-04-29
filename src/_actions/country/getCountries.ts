/** @format */

'use server';

// File: src/_actions/country/getCountries.ts
// Purpose: Fetch paginated countries list from the admin endpoint

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CountriesResponse } from '@/_types/country';
import { mapCountry, mapMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const EMPTY_RESPONSE: CountriesResponse = {
  data: [],
  metadata: {
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export async function getCountries(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: string;
    status?: 'all' | 'active' | 'inactive';
  }> = {},
): Promise<CountriesResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
  } = query;
  const headers = await getAuthenticatedRequestHeaders({
    refreshIfNeeded: true,
  });
  const params: Record<string, string | number> = { page, page_size: pageSize };
  if (sort) params.sort = sort;
  if (status) params.status = status;

  try {
      const { data } = await api.get<unknown>(API_ROUTES.COUNTRIES_ADMIN, {
        params,
        headers,
      });

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return EMPTY_RESPONSE;
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };
    return {
      data: raw.data.map(mapCountry),
      metadata: raw.metadata
        ? mapMetadata(raw.metadata)
        : EMPTY_RESPONSE.metadata,
    };
  } catch (error) {
    console.error('Failed to fetch admin countries', error);
    return EMPTY_RESPONSE;
  }
}
