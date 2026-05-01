/** @format */

'use server';

import type { Season } from '@/_types/season';
import { getAdminSeasons } from './getAdminSeasons';

const PAGE_SIZE = 100;

export async function getAllSeasons(): Promise<ReadonlyArray<Season>> {
  const seasons: Season[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminSeasons({
      page,
      pageSize: PAGE_SIZE,
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : seasons;
    }

    seasons.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return seasons;
    }

    page += 1;
  }
}
