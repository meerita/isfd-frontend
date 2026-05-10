/** @format */

'use client';

import { useMemo } from 'react';

import type { MeApiResult, MyContributionsListResponse } from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';

export function useMyContributions(
  result: MeApiResult<MyContributionsListResponse>,
  filtersAreDirty: boolean,
) {
  return useMemo(() => {
    const totalPages = Math.max(1, result.data?.metadata.total_pages ?? 1);
    const currentPage = result.data?.metadata.page ?? 1;

    return {
      result,
      currentPage,
      totalPages,
      emptyMessage: filtersAreDirty
        ? ACCOUNT_COPY.contributions.emptyFiltered
        : ACCOUNT_COPY.contributions.emptyInitial,
    };
  }, [filtersAreDirty, result]);
}
