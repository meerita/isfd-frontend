/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  CompetitionSort,
  CompetitionStatusFilter,
} from '@/_types/competition';

type SelectorOption = Readonly<{
  id: string;
  name: string;
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
  return (
    <Form method='GET' action={NAVIGATION.COMPETITIONS_LIST} gap={8}>
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
          label='Competition type'
          name='competition_type_id'
          defaultValue={competitionTypeId ?? ''}
        >
          <option value=''>All competition types</option>
          {competitionTypes.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select
          label='Federation'
          name='federation_id'
          defaultValue={federationId ?? ''}
        >
          <option value=''>All federations</option>
          {federations.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select label='Country' name='country_id' defaultValue={countryId ?? ''}>
          <option value=''>All countries</option>
          {countries.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>Apply</Button>
          <Button href={NAVIGATION.COMPETITIONS_LIST} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
}
