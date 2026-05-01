/** @format */

'use server';

import type { FederationListItem } from '@/_types/federation';
import { getAdminFederations } from './getAdminFederations';

const PAGE_SIZE = 100;

export async function getAllFederations(): Promise<ReadonlyArray<FederationListItem>> {
  const federations: FederationListItem[] = [];
  let page = 1;

  while (true) {
    const response = await getAdminFederations({
      page,
      pageSize: PAGE_SIZE,
      sort: 'name_asc',
      status: 'all',
    });

    if (response.error) {
      return page === 1 ? [] : federations;
    }

    federations.push(...response.data);

    if (!response.metadata.hasNextPage || page >= response.metadata.totalPages) {
      return federations;
    }

    page += 1;
  }
}
