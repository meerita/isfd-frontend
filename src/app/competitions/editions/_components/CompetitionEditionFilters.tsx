/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import {
  COMPETITION_EDITION_STATUSES,
  getCompetitionEditionStatusLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
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
  return (
    <Form method='GET' action={NAVIGATION.COMPETITION_EDITIONS} gap={8}>
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
          <option value='year_desc'>Year ↓</option>
          <option value='year_asc'>Year ↑</option>
          <option value='started_on_desc'>Started on ↓</option>
          <option value='started_on_asc'>Started on ↑</option>
        </Select>
        <Select label='Lifecycle status' name='status' defaultValue={status ?? 'all'}>
          <option value='all'>All statuses</option>
          {COMPETITION_EDITION_STATUSES.map(value => (
            <option key={value} value={value}>
              {getCompetitionEditionStatusLabel(value)}
            </option>
          ))}
        </Select>
        <Select
          label='Active status'
          name='active_status'
          defaultValue={activeStatus ?? 'all'}
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Competition'
          name='competition_id'
          defaultValue={competitionId ?? ''}
        >
          <option value=''>All competitions</option>
          {competitions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <NumberInput
          label='Year'
          name='year'
          type='number'
          defaultValue={typeof year === 'number' ? String(year) : ''}
        />
        <TextInput label='Search' name='q' defaultValue={q ?? ''} />
      </Grid>
      <Grid display='flex' gap={8} alignItems='center'>
        <Button type='submit'>Apply</Button>
        <Button href={NAVIGATION.COMPETITION_EDITIONS} variant='borderless'>
          Reset
        </Button>
      </Grid>
    </Form>
  );
}
