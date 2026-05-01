/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_TYPE_CATEGORIES,
  PARTICIPANT_SCOPES,
  getCompetitionTypeCategoryLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
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

export default function CompetitionTypeFilters({
  pageSize,
  sort,
  status,
  competitionTypeCategory,
  participantScope,
}: CompetitionTypeFiltersProps): React.JSX.Element {
  return (
    <Form method='GET' action={NAVIGATION.COMPETITION_TYPES} gap={8}>
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />
      <Grid gap={8} columns={5} alignItems='end'>
        <Select label='Sort' name='sort' defaultValue={sort}>
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='sort_order_asc'>Sort order ↑</option>
          <option value='sort_order_desc'>Sort order ↓</option>
          <option value='is_active_desc'>Active first</option>
          <option value='is_active_asc'>Inactive first</option>
        </Select>
        <Select label='Status' name='status' defaultValue={status ?? 'all'}>
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Category'
          name='competition_type_category'
          defaultValue={competitionTypeCategory ?? ''}
        >
          <option value=''>All categories</option>
          {COMPETITION_TYPE_CATEGORIES.map(value => (
            <option key={value} value={value}>
              {getCompetitionTypeCategoryLabel(value)}
            </option>
          ))}
        </Select>
        <Select
          label='Participant scope'
          name='participant_scope'
          defaultValue={participantScope ?? ''}
        >
          <option value=''>All scopes</option>
          {PARTICIPANT_SCOPES.map(value => (
            <option key={value} value={value}>
              {getParticipantScopeLabel(value)}
            </option>
          ))}
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>Apply</Button>
          <Button href={NAVIGATION.COMPETITION_TYPES} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
}
