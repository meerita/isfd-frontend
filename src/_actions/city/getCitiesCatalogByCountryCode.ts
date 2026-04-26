/** @format */

'use server';

// File: src/_actions/city/getCitiesCatalogByCountryCode.ts
// Purpose: Fetch all cities for a country to power dependent forms (by countryId)
// Note: Admin cities API has no metadata; fetches with large page_size.
// Author: Diego M. Lafuente

import { getCities } from '@/_actions/city/getCities';
import type { City } from '@/_types/city';

const CATALOG_PAGE_SIZE = 500;

function sortCities(cities: ReadonlyArray<City>): ReadonlyArray<City> {
  return [...cities].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );
}

/** @deprecated Use getCitiesCatalogByCountryId instead */
export async function getCitiesCatalogByCountryCode(
  _countryCode: string,
): Promise<ReadonlyArray<City>> {
  console.warn(
    '[getCitiesCatalogByCountryCode] Deprecated. Use getCitiesCatalogByCountryId with a country UUID.',
  );
  return [];
}

export async function getCitiesCatalogByCountryId(
  countryId: string,
): Promise<ReadonlyArray<City>> {
  if (!countryId.trim()) return [];

  const response = await getCities({
    countryId,
    pageSize: CATALOG_PAGE_SIZE,
    status: 'active',
  });

  return sortCities(response.data);
}
