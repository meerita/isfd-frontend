/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_SCOPE_KINDS,
  getCompetitionScopeKindLabel,
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

type CompetitionPyramidFiltersProps = Readonly<{
  pageSize: number;
  sort: CompetitionStructureSort;
  status?: CompetitionStructureStatusFilter;
  countryId?: string;
  federationId?: string;
  scopeKind?: string;
  countries: ReadonlyArray<SelectorOption>;
  federations: ReadonlyArray<SelectorOption>;
}>;

export default function CompetitionPyramidFilters({
  pageSize,
  sort,
  status,
  countryId,
  federationId,
  scopeKind,
  countries,
  federations,
}: CompetitionPyramidFiltersProps): React.JSX.Element {
  return (
    <Form method='GET' action={NAVIGATION.COMPETITION_PYRAMIDS} gap={8}>
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
        <Select label='Country' name='country_id' defaultValue={countryId ?? ''}>
          <option value=''>All countries</option>
          {countries.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select label='Federation' name='federation_id' defaultValue={federationId ?? ''}>
          <option value=''>All federations</option>
          {federations.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
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
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>Apply</Button>
          <Button href={NAVIGATION.COMPETITION_PYRAMIDS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
}
