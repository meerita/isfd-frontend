/** @format */

'use server';

// File: src/_actions/country/getAllCountries.ts
// Purpose: Fetch full countries catalog (all pages) from admin endpoint for dependent forms
// Author: Diego M. Lafuente

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Country } from '@/_types/country';
import { mapCountry } from '@/_actions/country/mappers';

const CATALOG_PAGE_SIZE = 500;

export async function getAllCountries(): Promise<ReadonlyArray<Country>> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.get<unknown>(API_ROUTES.COUNTRIES_ADMIN, {
      params: { page: 1, page_size: CATALOG_PAGE_SIZE, status: 'all' },
      headers,
    });

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return [];
    }

    const raw = data as { data: Record<string, unknown>[] };
    return raw.data.map(mapCountry);
  } catch (error) {
    console.error('Failed to fetch countries catalog', error);
    return [];
  }
}
