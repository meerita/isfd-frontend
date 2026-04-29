/** @format */

'use server';

import {
  getAdminCitiesByCountryIdAndProvince,
  getCities,
} from '@/_actions/city/getCities';
import type { City } from '@/_types/city';

const CATALOG_PAGE_SIZE = 100;

function sortCities(cities: ReadonlyArray<City>): ReadonlyArray<City> {
  return [...cities].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );
}

/** @deprecated Use getCitiesCatalogByCountryId instead */
export async function getCitiesCatalogByCountryCode(
  _countryCode: string,
): Promise<ReadonlyArray<City>> {
  void _countryCode;
  return [];
}

export async function getCitiesCatalogByCountryId(
  countryId: string,
  provinceName?: string,
): Promise<ReadonlyArray<City>> {
  if (!countryId.trim()) return [];

  if (provinceName?.trim()) {
    return getAdminCitiesByCountryIdAndProvince(countryId, provinceName);
  }

  const response = await getCities({
    countryId,
    pageSize: CATALOG_PAGE_SIZE,
    sort: 'slug_asc',
    status: 'all',
  });

  return sortCities(response.data);
}
