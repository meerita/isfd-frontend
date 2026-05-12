/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  MyContributionReviewStatusFilter,
  MyContributionSort,
  MyContributionTargetEntityTypeFilter,
} from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';

const FILTERS_TOAST_ID = 'my-contributions-filters-loading';

export default function MyContributionFilters({
  pageSize,
  sort,
  reviewStatus,
  targetEntityType,
}: Readonly<{
  pageSize: number;
  sort: MyContributionSort;
  reviewStatus: MyContributionReviewStatusFilter;
  targetEntityType: MyContributionTargetEntityTypeFilter;
}>): React.JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(function dismissFiltersToast(): void {
    if (!hasPendingNavigationRef.current) {
      return;
    }

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [pageSize, reviewStatus, sort, targetEntityType]);

  const handleChange = useCallback(function handleChange(): void {
    hasPendingNavigationRef.current = true;
    toast.loading('Actualizando filtros...', {
      id: FILTERS_TOAST_ID,
    });
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.ACCOUNT}>
      <Grid gap={8} columns={4} alignItems='end'>
        <input type='hidden' name='section' value='contributions' />
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />

        <Select
          label={ACCOUNT_COPY.contributions.sort}
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='created_at_desc'>
            {ACCOUNT_COPY.contributions.sortOptions.created_at_desc}
          </option>
          <option value='created_at_asc'>
            {ACCOUNT_COPY.contributions.sortOptions.created_at_asc}
          </option>
          <option value='updated_at_desc'>
            {ACCOUNT_COPY.contributions.sortOptions.updated_at_desc}
          </option>
          <option value='updated_at_asc'>
            {ACCOUNT_COPY.contributions.sortOptions.updated_at_asc}
          </option>
        </Select>

        <Select
          label={ACCOUNT_COPY.contributions.reviewStatus}
          name='review_status'
          defaultValue={reviewStatus}
          onChange={handleChange}
        >
          <option value='all'>
            {ACCOUNT_COPY.contributions.allReviewStatuses}
          </option>
          <option value='pending'>
            {ACCOUNT_COPY.contributions.reviewStatusLabels.pending}
          </option>
          <option value='approved'>
            {ACCOUNT_COPY.contributions.reviewStatusLabels.approved}
          </option>
          <option value='rejected'>
            {ACCOUNT_COPY.contributions.reviewStatusLabels.rejected}
          </option>
        </Select>

        <Select
          label={ACCOUNT_COPY.contributions.targetEntityType}
          name='target_entity_type'
          defaultValue={targetEntityType}
          onChange={handleChange}
        >
          <option value='all'>{ACCOUNT_COPY.contributions.allTargets}</option>
          <option value='stadium'>
            {ACCOUNT_COPY.contributions.targetEntityTypeLabels.stadium}
          </option>
          <option value='person'>
            {ACCOUNT_COPY.contributions.targetEntityTypeLabels.person}
          </option>
        </Select>

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={`${NAVIGATION.ACCOUNT}?section=contributions`} variant='borderless'>
            {ACCOUNT_COPY.contributions.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
