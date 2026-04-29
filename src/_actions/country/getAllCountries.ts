/** @format */

'use server';

// File: src/_actions/country/getAllCountries.ts
// Purpose: Fetch full countries catalog (all pages) from admin endpoint for dependent forms
// Author: Diego M. Lafuente

import { getCountries } from '@/_actions/country/getCountries';
import { normalizeApiError } from '@/_lib/apiError';
import API_ROUTES from '@/_constants/apiRoutes';
import ENV from '@/_constants/env';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import type { Country } from '@/_types/country';
import { mapCountry } from '@/_actions/country/mappers';

const FALLBACK_PAGE_SIZE = 100;

async function fetchAllCountriesCatalog(): Promise<ReadonlyArray<Country>> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
  const response = await fetch(`${ENV.apiBaseUrl}${API_ROUTES.ADMIN_COUNTRIES_ALL}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : typeof payload?.message === 'string'
          ? payload.message
          : `Failed to fetch countries catalog: ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as unknown;

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as Record<string, unknown>).data)
  ) {
    return [];
  }

  const raw = data as { data: Record<string, unknown>[] };
  return raw.data.map(mapCountry);
}

async function fetchPaginatedCountriesCatalog(): Promise<ReadonlyArray<Country>> {
  const countries: Country[] = [];
  let page = 1;

  while (true) {
    const response = await getCountries({
      page,
      pageSize: FALLBACK_PAGE_SIZE,
      sort: 'updated_at_desc',
      status: 'all',
    });

    countries.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return countries;
    }

    page += 1;
  }
}

export async function getAllCountries(): Promise<ReadonlyArray<Country>> {
  try {
    return await fetchAllCountriesCatalog();
  } catch (error) {
    try {
      return await fetchPaginatedCountriesCatalog();
    } catch (fallbackError) {
      console.error(
        'Failed to fetch countries catalog',
        normalizeApiError(fallbackError).data.error,
      );
      console.error('Initial countries catalog error', error);
      return [];
    }
  }
}
