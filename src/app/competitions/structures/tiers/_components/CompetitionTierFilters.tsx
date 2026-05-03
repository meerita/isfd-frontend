/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_SCOPE_KINDS,
  PARTICIPANT_SCOPES,
  getCompetitionScopeKindLabel,
  getParticipantScopeLabel,
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

type CompetitionTierFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionStructureSort;
  status?: CompetitionStructureStatusFilter;
  competitionPyramidId?: string;
  parentTierId?: string;
  participantScope?: string;
  scopeKind?: string;
  competitionPyramids: ReadonlyArray<SelectorOption>;
  parentTierOptions: ReadonlyArray<SelectorOption>;
}>;

const FILTERS_TOAST_ID = 'competition-tiers-filters-loading';

export default function CompetitionTierFilters({
  pageSize,
  sort,
  status,
  competitionPyramidId,
  parentTierId,
  participantScope,
  scopeKind,
  competitionPyramids,
  parentTierOptions,
}: CompetitionTierFiltersProps): React.JSX.Element {
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
      competitionPyramidId,
      pageSize,
      parentTierId,
      participantScope,
      scopeKind,
      sort,
      status,
    ],
  );

  const handleSubmit = useCallback(
    function handleSubmit(): void {
      hasPendingNavigationRef.current = true;
      toast.loading(dictionary.competitions.tiers.filters.updating, {
        id: FILTERS_TOAST_ID,
      });
    },
    [dictionary.competitions.tiers.filters.updating],
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
      action={NAVIGATION.COMPETITION_TIERS}
      onSubmit={handleSubmit}
    >
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />

      <Grid gap={8} columns={7} alignItems='end'>
        <Select name='sort' defaultValue={sort} onChange={handleChange}>
          <option value='updated_at_desc'>
            {dictionary.competitions.tiers.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.tiers.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.tiers.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.tiers.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.tiers.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.tiers.filters.nameDesc}
          </option>
        </Select>

        <Select
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>

        <Select
          name='competition_pyramid_id'
          defaultValue={competitionPyramidId ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.competitions.tiers.filters.allPyramids}</option>
          {competitionPyramids.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          name='parent_tier_id'
          defaultValue={parentTierId ?? ''}
          onChange={handleChange}
        >
          <option value=''>
            {dictionary.competitions.tiers.filters.allParentTiers}
          </option>
          {parentTierOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <Select
          name='participant_scope'
          defaultValue={participantScope ?? ''}
          onChange={handleChange}
        >
          <option value=''>
            {dictionary.competitions.tiers.filters.allParticipantScopes}
          </option>
          {PARTICIPANT_SCOPES.map(value => (
            <option key={value} value={value}>
              {getParticipantScopeLabel(value, locale)}
            </option>
          ))}
        </Select>

        <Select
          name='scope_kind'
          defaultValue={scopeKind ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.competitions.tiers.filters.allScopes}</option>
          {COMPETITION_SCOPE_KINDS.map(value => (
            <option key={value} value={value}>
              {getCompetitionScopeKindLabel(value, locale)}
            </option>
          ))}
        </Select>

        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COMPETITION_TIERS} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
