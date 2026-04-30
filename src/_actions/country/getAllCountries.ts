/** @format */

'use server';

import type { Country } from '@/_types/country';
import { getAdminCountries } from './getCountries';

const PAGE_SIZE = 100;

export async function getAllCountries(): Promise<ReadonlyArray<Country>> {
  const countries: Country[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminCountries({
      page,
      pageSize: PAGE_SIZE,
      sort: 'name_asc',
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : countries;
    }

    countries.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return countries;
    }

    page += 1;
  }
}
