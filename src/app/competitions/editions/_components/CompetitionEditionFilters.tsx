/** @format */

'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_EDITION_STATUSES,
  getCompetitionEditionStatusLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type {
  CompetitionEditionActiveStatusFilter,
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
} from '@/_types/competitionEdition';

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionEditionFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionEditionSort;
  status?: CompetitionEditionStatusFilter;
  activeStatus?: CompetitionEditionActiveStatusFilter;
  competitionId?: string;
  year?: number;
  q?: string;
  competitions: ReadonlyArray<SelectorOption>;
}>;

const FILTERS_TOAST_ID = 'competition-editions-filters-loading';

export default function CompetitionEditionFilters({
  pageSize,
  sort,
  status,
  activeStatus,
  competitionId,
  year,
  q,
  competitions,
}: CompetitionEditionFiltersProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();
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
    [activeStatus, competitionId, pageSize, q, sort, status, year],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.competitions.editions.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.competitions.editions.filters.updating],
  );

  const submitFilters = useCallback(
    function submitFilters(): void {
      handleSubmit();
      formRef.current?.requestSubmit();
    },
    [handleSubmit],
  );

  const handleInputKeyDown = useCallback(
    function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
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
      action={NAVIGATION.COMPETITION_EDITIONS}
      onSubmit={handleSubmit}
    >
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />

      <Grid gap={8} columns={6} alignItems='end'>
        <Select name='sort' defaultValue={sort} onChange={submitFilters}>
          <option value='updated_at_desc'>
            {dictionary.competitions.editions.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.editions.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.editions.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.editions.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.editions.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.editions.filters.nameDesc}
          </option>
          <option value='sort_order_asc'>
            {dictionary.competitions.editions.filters.sortOrderAsc}
          </option>
          <option value='sort_order_desc'>
            {dictionary.competitions.editions.filters.sortOrderDesc}
          </option>
          <option value='year_desc'>
            {dictionary.competitions.editions.filters.yearDesc}
          </option>
          <option value='year_asc'>
            {dictionary.competitions.editions.filters.yearAsc}
          </option>
          <option value='started_on_desc'>
            {dictionary.competitions.editions.filters.startedOnDesc}
          </option>
          <option value='started_on_asc'>
            {dictionary.competitions.editions.filters.startedOnAsc}
          </option>
        </Select>

        <Select
          name='status'
          defaultValue={status ?? 'all'}
          onChange={submitFilters}
        >
          <option value='all'>
            {dictionary.competitions.editions.filters.allStatuses}
          </option>
          {COMPETITION_EDITION_STATUSES.map(value => (
            <option key={value} value={value}>
              {getCompetitionEditionStatusLabel(value, locale)}
            </option>
          ))}
        </Select>

        <Select
          name='active_status'
          defaultValue={activeStatus ?? 'all'}
          onChange={submitFilters}
        >
          <option value='all'>
            {dictionary.competitions.editions.filters.allActiveStates}
          </option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>

        <Select
          name='competition_id'
          defaultValue={competitionId ?? ''}
          onChange={submitFilters}
        >
          <option value=''>
            {dictionary.competitions.editions.filters.allCompetitions}
          </option>
          {competitions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <NumberInput
          name='year'
          type='number'
          placeholder={dictionary.competitions.editions.filters.yearPlaceholder}
          defaultValue={typeof year === 'number' ? String(year) : ''}
          onBlur={submitFilters}
          onKeyDown={handleInputKeyDown}
        />

        <TextInput
          name='q'
          placeholder={dictionary.competitions.editions.filters.searchPlaceholder}
          defaultValue={q ?? ''}
          onBlur={submitFilters}
          onKeyDown={handleInputKeyDown}
        />
      </Grid>

      <Grid display='flex' gap={8} alignItems='center'>
        <Button href={NAVIGATION.COMPETITION_EDITIONS} variant='borderless'>
          {dictionary.common.reset}
        </Button>
      </Grid>
    </form>
  );
}
