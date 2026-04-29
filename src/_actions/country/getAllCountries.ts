/** @format */

'use server';

// File: src/_actions/country/getAllCountries.ts
// Purpose: Fetch full countries catalog (all pages) from admin endpoint for dependent forms
// Author: Diego M. Lafuente

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { Country } from '@/_types/country';
import { mapCountry } from '@/_actions/country/mappers';

export async function getAllCountries(): Promise<ReadonlyArray<Country>> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COUNTRIES_ADMIN_ALL);

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
