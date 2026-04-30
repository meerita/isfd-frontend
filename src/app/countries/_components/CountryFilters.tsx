/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type { CountrySort, CountryStatusFilter } from '@/_types/country';

type CountryFiltersProps = Readonly<{
  pageSize: number;
  sort: CountrySort;
  status?: CountryStatusFilter;
}>;

const FILTERS_TOAST_ID = 'countries-filters-loading';

export default function CountryFilters({
  pageSize,
  sort,
  status,
}: CountryFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [pageSize, sort, status]);

  const handleChange = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.COUNTRIES}>
      <Grid gap={8} columns={4} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
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
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.COUNTRIES} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
