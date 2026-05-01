/** @format */

'use server';

import type { Competition } from '@/_types/competition';
import { getAdminCompetitions } from './getAdminCompetitions';

const PAGE_SIZE = 100;

export async function getAllCompetitions(): Promise<ReadonlyArray<Competition>> {
  const competitions: Competition[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminCompetitions({
      page,
      pageSize: PAGE_SIZE,
      sort: 'name_asc',
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : competitions;
    }

    competitions.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return competitions;
    }

    page += 1;
  }
}
