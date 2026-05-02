/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_SCOPE_KINDS,
  PARTICIPANT_SCOPES,
  getCompetitionScopeKindLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
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
  return (
    <Form method='GET' action={NAVIGATION.COMPETITION_TIERS} gap={8}>
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />
      <Grid gap={8} columns={6} alignItems='end'>
        <Select label='Sort' name='sort' defaultValue={sort}>
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
        </Select>
        <Select label='Status' name='status' defaultValue={status ?? 'all'}>
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Competition pyramid'
          name='competition_pyramid_id'
          defaultValue={competitionPyramidId ?? ''}
        >
          <option value=''>All pyramids</option>
          {competitionPyramids.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select
          label='Parent tier'
          name='parent_tier_id'
          defaultValue={parentTierId ?? ''}
        >
          <option value=''>All parent tiers</option>
          {parentTierOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
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
        <Select label='Scope' name='scope_kind' defaultValue={scopeKind ?? ''}>
          <option value=''>All scopes</option>
          {COMPETITION_SCOPE_KINDS.map(value => (
            <option key={value} value={value}>
              {getCompetitionScopeKindLabel(value)}
            </option>
          ))}
        </Select>
      </Grid>
      <Grid display='flex' gap={8} alignItems='center'>
        <Button type='submit'>Apply</Button>
        <Button href={NAVIGATION.COMPETITION_TIERS} variant='borderless'>
          Reset
        </Button>
      </Grid>
    </Form>
  );
}
