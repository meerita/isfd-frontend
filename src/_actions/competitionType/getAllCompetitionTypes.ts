/** @format */

'use server';

import type { CompetitionType } from '@/_types/competitionType';
import { getAdminCompetitionTypes } from './getAdminCompetitionTypes';

const PAGE_SIZE = 100;

export async function getAllCompetitionTypes(): Promise<
  ReadonlyArray<CompetitionType>
> {
  const competitionTypes: CompetitionType[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminCompetitionTypes({
      page,
      pageSize: PAGE_SIZE,
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : competitionTypes;
    }

    competitionTypes.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return competitionTypes;
    }

    page += 1;
  }
}
