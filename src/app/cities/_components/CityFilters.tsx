/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type { AdminCitySort, CityStatusFilter } from '@/_types/city';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';

type CityFiltersProps = Readonly<{
  pageSize: number;
  sort: AdminCitySort;
  status?: CityStatusFilter;
  countryId?: string;
  province?: string;
  countries: ReadonlyArray<CountrySelectOption>;
  provinces: ReadonlyArray<ProvinceAdmin>;
}>;

const FILTERS_TOAST_ID = 'cities-filters-loading';

export default function CityFilters({
  pageSize,
  sort,
  status,
  countryId,
  province,
  countries,
  provinces,
}: CityFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [countryId, pageSize, province, sort, status]);

  const submit = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
    queueMicrotask(() => {
      formRef.current?.requestSubmit();
    });
  }, []);

  const handleCountryChange = useCallback(
    (value: string) => {
      const form = formRef.current;
      if (!form) return;

      const countryInput = form.elements.namedItem('country_id');
      if (countryInput instanceof HTMLSelectElement) {
        countryInput.value = value;
      }

      const provinceInput = form.elements.namedItem('province');
      if (provinceInput instanceof HTMLSelectElement) {
        provinceInput.value = '';
      }

      submit();
    },
    [submit],
  );

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.CITIES}>
      <Grid gap={8} columns={5} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={submit}
        >
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='slug_asc'>Slug A-Z</option>
          <option value='slug_desc'>Slug Z-A</option>
        </Select>
        <Select
          label='Status'
          name='status'
          defaultValue={status ?? 'all'}
          onChange={submit}
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Country'
          name='country_id'
          defaultValue={countryId ?? ''}
          onChange={event => {
            handleCountryChange(event.target.value);
          }}
        >
          <option value=''>All countries</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </Select>
        <Select
          label='Province'
          name='province'
          defaultValue={province ?? ''}
          onChange={submit}
          disabled={!countryId}
          helperText={
            !countryId
              ? 'Select a country to filter provinces.'
              : provinces.length === 0
                ? 'No provinces available for the selected country.'
                : undefined
          }
        >
          <option value=''>All provinces</option>
          {provinces.map(currentProvince => (
            <option key={currentProvince.name} value={currentProvince.name}>
              {currentProvince.name}
            </option>
          ))}
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.CITIES} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
