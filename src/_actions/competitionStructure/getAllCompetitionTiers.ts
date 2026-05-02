/** @format */

'use server';

import type { CompetitionTier } from '@/_types/competitionStructure';
import { getAdminCompetitionTiers } from './getAdminCompetitionTiers';

const PAGE_SIZE = 100;

export async function getAllCompetitionTiers(): Promise<
  ReadonlyArray<CompetitionTier>
> {
  const competitionTiers: CompetitionTier[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminCompetitionTiers({
      page,
      pageSize: PAGE_SIZE,
      sort: 'name_asc',
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : competitionTiers;
    }

    competitionTiers.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return competitionTiers;
    }

    page += 1;
  }
}
