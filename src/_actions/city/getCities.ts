/** @format */

'use server';

// File: src/_actions/city/getCities.ts
// Purpose: Fetch cities for a country from the admin endpoint

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CitiesResponse } from '@/_types/city';
import { mapCity, mapMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const EMPTY_RESPONSE: CitiesResponse = {
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

export async function getCities({
  countryId,
  page,
  pageSize,
  sort,
  status,
}: Readonly<{
  countryId: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  status?: 'all' | 'active' | 'inactive';
}>): Promise<CitiesResponse> {
  if (!countryId) return EMPTY_RESPONSE;

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
  const params: Record<string, string | number> = {};
  if (page) params.page = page;
  if (pageSize) params.page_size = pageSize;
  if (sort) params.sort = sort;
  if (status) params.status = status;

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.CITIES_ADMIN_BY_COUNTRY(countryId),
      { params, headers },
    );

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
      data: raw.data.map(mapCity),
      metadata: raw.metadata ? mapMetadata(raw.metadata) : EMPTY_RESPONSE.metadata,
    };
  } catch (error) {
    console.error(`Failed to fetch cities for country ${countryId}`, error);
    return EMPTY_RESPONSE;
  }
}
