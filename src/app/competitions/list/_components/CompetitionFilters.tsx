/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import { getCompetitionTypeCodeLabel } from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type {
  CompetitionSort,
  CompetitionStatusFilter,
} from '@/_types/competition';

type SelectorOption = Readonly<{
  id: string;
  name: string;
  code?: string;
}>;

type CompetitionFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionSort;
  status?: CompetitionStatusFilter;
  competitionTypeId?: string;
  federationId?: string;
  countryId?: string;
  competitionTypes: ReadonlyArray<SelectorOption>;
  federations: ReadonlyArray<SelectorOption>;
  countries: ReadonlyArray<SelectorOption>;
}>;

const FILTERS_TOAST_ID = 'competitions-filters-loading';

export default function CompetitionFilters({
  pageSize,
  sort,
  status,
  competitionTypeId,
  federationId,
  countryId,
  competitionTypes,
  federations,
  countries,
}: CompetitionFiltersProps): React.JSX.Element {
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
    [
      competitionTypeId,
      countryId,
      federationId,
      pageSize,
      sort,
      status,
    ],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.competitions.list.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.competitions.list.filters.updating],
  );

  const handleChange = useCallback(
    function handleChange(): void {
      handleSubmit();
      formRef.current?.requestSubmit();
    },
    [handleSubmit],
  );

  return (
    <form
      ref={formRef}
      method='GET'
      action={NAVIGATION.COMPETITIONS_LIST}
      onSubmit={handleSubmit}
    >
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />

      <Grid gap={8} columns={6} alignItems='end'>
        <Select
          label={dictionary.competitions.list.filters.sort}
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>
            {dictionary.competitions.list.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.list.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.list.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.list.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.list.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.list.filters.nameDesc}
          </option>
          <option value='sort_order_asc'>
            {dictionary.competitions.list.filters.sortOrderAsc}
          </option>
          <option value='sort_order_desc'>
            {dictionary.competitions.list.filters.sortOrderDesc}
          </option>
          <option value='is_active_desc'>
            {dictionary.competitions.list.filters.activeFirst}
          </option>
          <option value='is_active_asc'>
            {dictionary.competitions.list.filters.inactiveFirst}
          </option>
        </Select>

        <Select
          label={dictionary.competitions.list.filters.status}
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>

        <Select
          label={dictionary.competitions.list.filters.competitionType}
          name='competition_type_id'
          defaultValue={competitionTypeId ?? ''}
          onChange={handleChange}
        >
          <option value=''>
            {dictionary.competitions.list.filters.allCompetitionTypes}
          </option>
          {competitionTypes.map(option => (
            <option key={option.id} value={option.id}>
              {option.code
                ? getCompetitionTypeCodeLabel(option.code, locale)
                : option.name}
            </option>
          ))}
        </Select>

        <Select
          label={dictionary.competitions.list.filters.federation}
          name='federation_id'
          defaultValue={federationId ?? ''}
          onChange={handleChange}
        >
          <option value=''>
            {dictionary.competitions.list.filters.allFederations}
          </option>
          {federations.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          label={dictionary.competitions.list.filters.country}
          name='country_id'
          defaultValue={countryId ?? ''}
          onChange={handleChange}
        >
          <option value=''>
            {dictionary.competitions.list.filters.allCountries}
          </option>
          {countries.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COMPETITIONS_LIST} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
