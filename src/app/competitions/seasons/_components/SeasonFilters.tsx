/** @format */

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type { SeasonSort, SeasonStatusFilter } from '@/_types/season';

type SeasonFiltersProps = Readonly<{
  pageSize: number;
  sort: SeasonSort;
  status?: SeasonStatusFilter;
  year?: number;
}>;

export default function SeasonFilters({
  pageSize,
  sort,
  status,
  year,
}: SeasonFiltersProps): React.JSX.Element {
  return (
    <Form method='GET' action={NAVIGATION.COMPETITION_SEASONS} gap={8}>
      <input type='hidden' name='page' value='1' />
      <input type='hidden' name='page_size' value={String(pageSize)} />
      <Grid gap={8} columns={4} alignItems='end'>
        <Select label='Sort' name='sort' defaultValue={sort}>
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='start_year_desc'>Start year ↓</option>
          <option value='start_year_asc'>Start year ↑</option>
        </Select>
        <Select label='Status' name='status' defaultValue={status ?? 'all'}>
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <NumberInput
          label='Year'
          name='year'
          type='number'
          min='1'
          defaultValue={typeof year === 'number' ? String(year) : ''}
        />
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>Apply</Button>
          <Button href={NAVIGATION.COMPETITION_SEASONS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
}
