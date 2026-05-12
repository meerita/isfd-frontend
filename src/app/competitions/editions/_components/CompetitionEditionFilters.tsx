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
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
  CompetitionEditionVisibilityFilter,
} from '@/_types/competitionEdition';

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionEditionFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionEditionSort;
  status?: CompetitionEditionStatusFilter;
  visibility?: CompetitionEditionVisibilityFilter;
  competitionId?: string;
  competitionPyramidId?: string;
  primaryCompetitionTierId?: string;
  year?: number;
  q?: string;
  competitions: ReadonlyArray<SelectorOption>;
  competitionPyramids: ReadonlyArray<SelectorOption>;
  competitionTiers: ReadonlyArray<SelectorOption>;
}>;

const FILTERS_TOAST_ID = 'competition-editions-filters-loading';

export default function CompetitionEditionFilters({
  pageSize,
  sort,
  status,
  visibility,
  competitionId,
  competitionPyramidId,
  primaryCompetitionTierId,
  year,
  q,
  competitions,
  competitionPyramids,
  competitionTiers,
}: CompetitionEditionFiltersProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) {
      return;
    }

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [
    competitionId,
    competitionPyramidId,
    pageSize,
    primaryCompetitionTierId,
    q,
    sort,
    status,
    visibility,
    year,
  ]);

  const handleSubmit = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading(dictionary.competitions.editions.filters.updating, {
      id: FILTERS_TOAST_ID,
    });
  }, [dictionary.competitions.editions.filters.updating]);

  const submitFilters = useCallback(() => {
    handleSubmit();
    formRef.current?.requestSubmit();
  }, [handleSubmit]);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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

      <Grid gap={8} columns={8} alignItems='end'>
        <Select label='Sort' name='sort' defaultValue={sort} onChange={submitFilters}>
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
          label='Editorial status'
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
          label='Visibility'
          name='visibility'
          defaultValue={visibility ?? 'all'}
          onChange={submitFilters}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='public'>Public</option>
          <option value='private'>Private</option>
        </Select>

        <Select
          label='Competition'
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

        <Select
          label='Competition pyramid'
          name='competition_pyramid_id'
          defaultValue={competitionPyramidId ?? ''}
          onChange={submitFilters}
        >
          <option value=''>All competition pyramids</option>
          {competitionPyramids.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          label='Primary competition tier'
          name='primary_competition_tier_id'
          defaultValue={primaryCompetitionTierId ?? ''}
          onChange={submitFilters}
        >
          <option value=''>All primary competition tiers</option>
          {competitionTiers.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <NumberInput
          label='Year'
          name='year'
          type='number'
          placeholder={dictionary.competitions.editions.filters.yearPlaceholder}
          defaultValue={typeof year === 'number' ? String(year) : ''}
          onBlur={submitFilters}
          onKeyDown={handleInputKeyDown}
        />

        <TextInput
          label='Search'
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
