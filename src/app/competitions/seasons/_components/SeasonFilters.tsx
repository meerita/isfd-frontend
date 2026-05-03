/** @format */

'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { SeasonSort, SeasonStatusFilter } from '@/_types/season';

type SeasonFiltersProps = Readonly<{
  pageSize: number;
  sort: SeasonSort;
  status?: SeasonStatusFilter;
  year?: number;
}>;

const FILTERS_TOAST_ID = 'seasons-filters-loading';

export default function SeasonFilters({
  pageSize,
  sort,
  status,
  year,
}: SeasonFiltersProps): React.JSX.Element {
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
    [pageSize, sort, status, year],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.competitions.seasons.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.competitions.seasons.filters.updating],
  );

  const submitFilters = useCallback(
    function submitFilters(): void {
      handleSubmit();
      formRef.current?.requestSubmit();
    },
    [handleSubmit],
  );

  const handleYearKeyDown = useCallback(
    function handleYearKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      submitFilters();
    },
    [submitFilters],
  );

  return (
    <form
      ref={formRef}
      method='GET'
      action={NAVIGATION.COMPETITION_SEASONS}
      onSubmit={handleSubmit}
    >
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />

      <Grid gap={8} columns={4} alignItems='end'>
        <Select name='sort' defaultValue={sort} onChange={submitFilters}>
          <option value='updated_at_desc'>
            {dictionary.competitions.seasons.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.seasons.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.seasons.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.seasons.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.seasons.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.seasons.filters.nameDesc}
          </option>
          <option value='start_year_desc'>
            {dictionary.competitions.seasons.filters.startYearDesc}
          </option>
          <option value='start_year_asc'>
            {dictionary.competitions.seasons.filters.startYearAsc}
          </option>
        </Select>

        <Select
          name='status'
          defaultValue={status ?? 'all'}
          onChange={submitFilters}
        >
          <option value='all'>
            {dictionary.competitions.seasons.filters.allStatuses}
          </option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>

        <NumberInput
          name='year'
          type='number'
          min='1'
          placeholder={dictionary.competitions.seasons.filters.yearPlaceholder}
          defaultValue={typeof year === 'number' ? String(year) : ''}
          onBlur={submitFilters}
          onKeyDown={handleYearKeyDown}
        />

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COMPETITION_SEASONS} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
