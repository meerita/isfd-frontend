/** @format */

'use server';

// File: src/_actions/city/getCitiesCatalogByCountryCode.ts
// Purpose: Fetch the full cities catalog for a country to power dependent forms
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { getCities } from '@/_actions/city/getCities';
import type { City } from '@/_types/city';

const PAGE_LIMIT = 200;

function sortCities(cities: ReadonlyArray<City>): ReadonlyArray<City> {
  return [...cities].sort(function sortByName(
    cityA: City,
    cityB: City,
  ): number {
    return cityA.name.localeCompare(cityB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

export async function getCitiesCatalogByCountryCode(
  countryCode: string,
): Promise<ReadonlyArray<City>> {
  const normalizedCountryCode = countryCode.trim().toUpperCase();

  if (!normalizedCountryCode) {
    return [];
  }

  const firstResponse = await getCities({
    countryCode: normalizedCountryCode,
    page: 1,
    limit: PAGE_LIMIT,
  });
  const totalPages = Math.max(1, firstResponse.pagination?.totalPages || 1);

  if (totalPages === 1) {
    return sortCities(firstResponse.data);
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, function buildPage(_, index) {
      return getCities({
        countryCode: normalizedCountryCode,
        page: index + 2,
        limit: PAGE_LIMIT,
      });
    }),
  );

  return sortCities(
    [firstResponse, ...remainingResponses].flatMap(
      function extractData(response) {
        return response.data;
      },
    ),
  );
}
