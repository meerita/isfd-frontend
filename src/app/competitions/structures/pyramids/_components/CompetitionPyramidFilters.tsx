/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_PYRAMID_BRANCH_KINDS,
  COMPETITION_PYRAMID_SCOPE_KINDS,
  getCompetitionPyramidBranchKindLabel,
  getCompetitionPyramidScopeKindLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type {
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
} from '@/_types/competitionStructure';

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionPyramidFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionStructureSort;
  status?: CompetitionStructureStatusFilter;
  countryId?: string;
  federationId?: string;
  scopeKind?: string;
  branchKind?: string;
  asOfDate?: string;
  countries: ReadonlyArray<SelectorOption>;
  federations: ReadonlyArray<SelectorOption>;
}>;

const FILTERS_TOAST_ID = 'competition-pyramids-filters-loading';

export default function CompetitionPyramidFilters({
  pageSize,
  sort,
  status,
  countryId,
  federationId,
  scopeKind,
  branchKind,
  asOfDate,
  countries,
  federations,
}: CompetitionPyramidFiltersProps): React.JSX.Element {
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
    [asOfDate, branchKind, countryId, federationId, pageSize, scopeKind, sort, status],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.competitions.pyramids.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.competitions.pyramids.filters.updating],
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
      action={NAVIGATION.COMPETITION_PYRAMIDS}
      onSubmit={handleSubmit}
    >
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />

      <Grid gap={8} columns={8} alignItems='end'>
        <Select
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.sort}
        >
          <option value='updated_at_desc'>
            {dictionary.competitions.pyramids.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.pyramids.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.pyramids.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.pyramids.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.pyramids.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.pyramids.filters.nameDesc}
          </option>
        </Select>

        <Select
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.status}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>

        <Select
          name='country_id'
          defaultValue={countryId ?? ''}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.country}
        >
          <option value=''>
            {dictionary.competitions.pyramids.filters.allCountries}
          </option>
          {countries.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          name='federation_id'
          defaultValue={federationId ?? ''}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.federation}
        >
          <option value=''>
            {dictionary.competitions.pyramids.filters.allFederations}
          </option>
          {federations.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          name='scope_kind'
          defaultValue={scopeKind ?? ''}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.scope}
        >
          <option value=''>
            {dictionary.competitions.pyramids.filters.allScopes}
          </option>
          {COMPETITION_PYRAMID_SCOPE_KINDS.map(value => (
            <option key={value} value={value}>
              {getCompetitionPyramidScopeKindLabel(value, locale)}
            </option>
          ))}
        </Select>

        <Select
          name='branch_kind'
          defaultValue={branchKind ?? ''}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.branch}
        >
          <option value=''>
            {dictionary.competitions.pyramids.filters.allBranches}
          </option>
          {COMPETITION_PYRAMID_BRANCH_KINDS.map(value => (
            <option key={value} value={value}>
              {getCompetitionPyramidBranchKindLabel(value, locale)}
            </option>
          ))}
        </Select>

        <TextInput
          type='date'
          name='as_of_date'
          defaultValue={asOfDate ?? ''}
          onChange={handleChange}
          aria-label={dictionary.competitions.pyramids.filters.asOfDate}
        />

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COMPETITION_PYRAMIDS} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
