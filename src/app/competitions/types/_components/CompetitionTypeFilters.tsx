/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_TYPE_CATEGORIES,
  PARTICIPANT_SCOPES,
  getCompetitionTypeCategoryLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type {
  CompetitionTypeSort,
  CompetitionTypeStatusFilter,
} from '@/_types/competitionType';

type CompetitionTypeFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionTypeSort;
  status?: CompetitionTypeStatusFilter;
  competitionTypeCategory?: string;
  participantScope?: string;
}>;

const FILTERS_TOAST_ID = 'competition-types-filters-loading';

export default function CompetitionTypeFilters({
  pageSize,
  sort,
  status,
  competitionTypeCategory,
  participantScope,
}: CompetitionTypeFiltersProps): React.JSX.Element {
  const { dictionary, locale } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [competitionTypeCategory, pageSize, participantScope, sort, status]);

  const handleChange = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading(dictionary.competitions.types.filters.updating, {
      id: FILTERS_TOAST_ID,
    });
    formRef.current?.requestSubmit();
  }, [dictionary.competitions.types.filters.updating]);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.COMPETITION_TYPES}>
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />
      <Grid gap={8} columns={5} alignItems='end'>
        <Select
          label={dictionary.competitions.types.filters.sort}
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>
            {dictionary.competitions.types.filters.updatedDesc}
          </option>
          <option value='updated_at_asc'>
            {dictionary.competitions.types.filters.updatedAsc}
          </option>
          <option value='created_at_desc'>
            {dictionary.competitions.types.filters.createdDesc}
          </option>
          <option value='created_at_asc'>
            {dictionary.competitions.types.filters.createdAsc}
          </option>
          <option value='name_asc'>
            {dictionary.competitions.types.filters.nameAsc}
          </option>
          <option value='name_desc'>
            {dictionary.competitions.types.filters.nameDesc}
          </option>
          <option value='sort_order_asc'>
            {dictionary.competitions.types.filters.sortOrderAsc}
          </option>
          <option value='sort_order_desc'>
            {dictionary.competitions.types.filters.sortOrderDesc}
          </option>
          <option value='is_active_desc'>
            {dictionary.competitions.types.filters.activeFirst}
          </option>
          <option value='is_active_asc'>
            {dictionary.competitions.types.filters.inactiveFirst}
          </option>
        </Select>
        <Select
          label={dictionary.competitions.types.filters.status}
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>{dictionary.common.all}</option>
          <option value='active'>{dictionary.common.active}</option>
          <option value='inactive'>{dictionary.common.inactive}</option>
        </Select>
        <Select
          label={dictionary.competitions.types.filters.category}
          name='competition_type_category'
          defaultValue={competitionTypeCategory ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.competitions.types.filters.allCategories}</option>
          {COMPETITION_TYPE_CATEGORIES.map(value => (
            <option key={value} value={value}>
              {getCompetitionTypeCategoryLabel(value, locale)}
            </option>
          ))}
        </Select>
        <Select
          label={dictionary.competitions.types.filters.participantScope}
          name='participant_scope'
          defaultValue={participantScope ?? ''}
          onChange={handleChange}
        >
          <option value=''>{dictionary.competitions.types.filters.allScopes}</option>
          {PARTICIPANT_SCOPES.map(value => (
            <option key={value} value={value}>
              {getParticipantScopeLabel(value, locale)}
            </option>
          ))}
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COMPETITION_TYPES} variant='borderless'>
            {dictionary.common.reset}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
