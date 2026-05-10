/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type { ClubSort, ClubStatusFilter } from '@/_types/club';

type CountryOption = Readonly<{
  id: string;
  name: string;
}>;

type ClubFiltersProps = Readonly<{
  pageSize: number;
  sort: ClubSort;
  status?: ClubStatusFilter;
  countryId?: string;
  countries: ReadonlyArray<CountryOption>;
  countriesError?: string | null;
}>;

const FILTERS_TOAST_ID = 'clubs-filters-loading';

export default function ClubFilters({
  pageSize,
  sort,
  status,
  countryId,
  countries,
  countriesError = null,
}: ClubFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [countryId, pageSize, sort, status]);

  const handleChange = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.CLUBS}>
      <Grid gap={8} columns={4} alignItems='end'>
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
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='is_public_desc'>Active first</option>
          <option value='is_public_asc'>Inactive first</option>
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
        <Select
          label='Country'
          name='country_id'
          defaultValue={countryId ?? ''}
          onChange={handleChange}
          disabled={Boolean(countriesError)}
          error={Boolean(countriesError)}
          helperText={countriesError ?? undefined}
        >
          <option value=''>All countries</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.CLUBS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
