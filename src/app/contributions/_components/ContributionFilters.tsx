/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  ContributionAdminReviewStatusFilter,
  ContributionAdminSort,
  ContributionAdminTargetEntityTypeFilter,
} from '@/_types/contribution';
import { useI18n } from '@/_i18n/I18nProvider';

type ContributionFiltersProps = Readonly<{
  pageSize: number;
  sort: ContributionAdminSort;
  reviewStatus: ContributionAdminReviewStatusFilter;
  targetEntityType: ContributionAdminTargetEntityTypeFilter;
}>;

const FILTERS_TOAST_ID = 'contributions-filters-loading';

export default function ContributionFilters({
  pageSize,
  sort,
  reviewStatus,
  targetEntityType,
}: ContributionFiltersProps): React.JSX.Element {
  const { dictionary } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(
    function syncFilterToast(): void {
      if (!hasPendingNavigationRef.current) {
        return;
      }

      hasPendingNavigationRef.current = false;
      toast.dismiss(FILTERS_TOAST_ID);
    },
    [pageSize, reviewStatus, sort, targetEntityType],
  );

  const handleChange = useCallback(
    function handleChange(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.contributions.list.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
      formRef.current?.requestSubmit();
    },
    [dictionary.contributions.list.filters.updating],
  );

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.CONTRIBUTIONS}>
      <Grid gap={8} columns={4} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />

        <Select
          label={dictionary.contributions.list.filters.sort}
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>
            {dictionary.contributions.list.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.contributions.list.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.contributions.list.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.contributions.list.filters.createdAsc}
          </option>
        </Select>

        <Select
          label={dictionary.contributions.list.filters.reviewStatus}
          name='review_status'
          defaultValue={reviewStatus}
          onChange={handleChange}
        >
          <option value='all'>
            {dictionary.contributions.list.filters.allReviewStatuses}
          </option>
          <option value='pending'>
            {dictionary.contributions.list.filters.pendingStatus}
          </option>
          <option value='approved'>
            {dictionary.contributions.list.filters.approvedStatus}
          </option>
          <option value='rejected'>
            {dictionary.contributions.list.filters.rejectedStatus}
          </option>
        </Select>

        <Select
          label={dictionary.contributions.list.filters.targetEntityType}
          name='target_entity_type'
          defaultValue={targetEntityType}
          onChange={handleChange}
        >
          <option value='all'>{dictionary.contributions.list.filters.allTargets}</option>
          <option value='stadium'>
            {dictionary.contributions.list.filters.stadiumOnly}
          </option>
          <option value='person'>
            {dictionary.contributions.list.filters.personOnly}
          </option>
        </Select>

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.CONTRIBUTIONS} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
