/** @format */

'use server';

import type { CompetitionPyramid } from '@/_types/competitionStructure';
import { getAdminCompetitionPyramids } from './getAdminCompetitionPyramids';

const PAGE_SIZE = 100;

export async function getAllCompetitionPyramids(): Promise<
  ReadonlyArray<CompetitionPyramid>
> {
  const competitionPyramids: CompetitionPyramid[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminCompetitionPyramids({
      page,
      pageSize: PAGE_SIZE,
      sort: 'name_asc',
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : competitionPyramids;
    }

    competitionPyramids.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return competitionPyramids;
    }

    page += 1;
  }
}
