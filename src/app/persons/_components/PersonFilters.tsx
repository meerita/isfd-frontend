/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';

type PersonFiltersProps = Readonly<{
  pageSize: number;
  sort: PersonSort;
  status?: PersonStatusFilter;
  gender?: string;
  currentProfession?: string;
}>;

const FILTERS_TOAST_ID = 'persons-filters-loading';

export default function PersonFilters({
  pageSize,
  sort,
  status,
  gender,
  currentProfession,
}: PersonFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [currentProfession, gender, pageSize, sort, status]);

  const handleSubmit = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
  }, []);

  const handleChange = useCallback(() => {
    handleSubmit();
    formRef.current?.requestSubmit();
  }, [handleSubmit]);

  return (
    <form
      ref={formRef}
      method='GET'
      action={NAVIGATION.PERSONS}
      onSubmit={handleSubmit}
    >
      <Grid gap={8} columns={6} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='full_name_asc'>Full name A-Z</option>
          <option value='full_name_desc'>Full name Z-A</option>
          <option value='display_name_asc'>Display name A-Z</option>
          <option value='display_name_desc'>Display name Z-A</option>
          <option value='is_active_desc'>Active first</option>
          <option value='is_active_asc'>Inactive first</option>
        </Select>
        <Select
          label='Status'
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <TextInput
          label='Gender'
          name='gender'
          defaultValue={gender ?? ''}
          placeholder='Any gender'
        />
        <TextInput
          label='Current profession'
          name='current_profession'
          defaultValue={currentProfession ?? ''}
          placeholder='Any profession'
        />
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit'>Apply</Button>
          <Button href={NAVIGATION.PERSONS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
