/** @format */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { toast } from 'sonner';

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  StadiumAdminSort,
  StadiumStatusFilter,
} from '@/_types/stadium';

type CountryOption = Readonly<{
  id: string;
  name: string;
}>;

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type StadiumFiltersProps = Readonly<{
  pageSize: number;
  sort: StadiumAdminSort;
  status?: StadiumStatusFilter;
  countryId?: string;
  cityId?: string;
  primaryClubId?: string;
  countries: ReadonlyArray<CountryOption>;
  initialCities?: ReadonlyArray<SelectorOption>;
  initialCitiesError?: string | null;
  selectedCityLabel?: string | null;
}>;

const FILTERS_TOAST_ID = 'stadiums-filters-loading';

export default function StadiumFilters({
  pageSize,
  sort,
  status,
  countryId,
  cityId,
  primaryClubId,
  countries,
  initialCities = [],
  initialCitiesError = null,
  selectedCityLabel = null,
}: StadiumFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const latestCitiesRequest = useRef(0);
  const hasPendingNavigationRef = useRef(false);
  const dismissTimeoutRef = useRef<number | null>(null);

  const [selectedCountryId, setSelectedCountryId] = useState(countryId ?? '');
  const [selectedCityId, setSelectedCityId] = useState(cityId ?? '');
  const [primaryClubValue, setPrimaryClubValue] = useState(primaryClubId ?? '');
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialCities,
  );
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [citiesError, setCitiesError] = useState(initialCitiesError ?? '');

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    if (dismissTimeoutRef.current !== null) {
      globalThis.window?.clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [cityId, countryId, pageSize, primaryClubId, sort, status]);

  useEffect(
    () => () => {
      if (dismissTimeoutRef.current !== null) {
        globalThis.window?.clearTimeout(dismissTimeoutRef.current);
      }

      toast.dismiss(FILTERS_TOAST_ID);
    },
    [],
  );

  const mergedCityOptions = useMemo(() => {
    if (!selectedCityId || cityOptions.some(city => city.id === selectedCityId)) {
      return cityOptions;
    }

    return [
      {
        id: selectedCityId,
        name: selectedCityLabel ?? selectedCityId,
      },
      ...cityOptions,
    ];
  }, [cityOptions, selectedCityId, selectedCityLabel]);

  const submitFilters = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });

    if (dismissTimeoutRef.current !== null) {
      globalThis.window?.clearTimeout(dismissTimeoutRef.current);
    }

    dismissTimeoutRef.current = globalThis.window?.setTimeout(() => {
      hasPendingNavigationRef.current = false;
      dismissTimeoutRef.current = null;
      toast.dismiss(FILTERS_TOAST_ID);
    }, 4000) ?? null;

    formRef.current?.requestSubmit();
  }, []);

  const loadCitiesForCountry = useCallback(async (nextCountryId: string) => {
    const requestId = latestCitiesRequest.current + 1;
    latestCitiesRequest.current = requestId;

    if (!nextCountryId) {
      setCityOptions([]);
      setCitiesError('');
      setIsCitiesPending(false);
      return;
    }

    setIsCitiesPending(true);
    setCitiesError('');

    const response = await getGeoCitiesByCountry(nextCountryId);
    if (latestCitiesRequest.current !== requestId) return;

    if (response.error) {
      setCityOptions([]);
      setCitiesError(
        response.error.error || 'We could not load cities for the selected country.',
      );
      setIsCitiesPending(false);
      return;
    }

    setCityOptions(response.data.map(city => ({ id: city.id, name: city.name })));
    setCitiesError('');
    setIsCitiesPending(false);
  }, []);

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextCountryId = event.target.value;
      setSelectedCountryId(nextCountryId);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');

      const form = formRef.current;
      const cityField = form?.elements.namedItem('city_id');
      if (cityField instanceof HTMLSelectElement) {
        cityField.value = '';
      }

      void loadCitiesForCountry(nextCountryId);
      submitFilters();
    },
    [loadCitiesForCountry, submitFilters],
  );

  const handleCityChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCityId(event.target.value);
      submitFilters();
    },
    [submitFilters],
  );

  const handleSelectChange = useCallback(() => {
    submitFilters();
  }, [submitFilters]);

  const handlePrimaryClubChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPrimaryClubValue(event.target.value);
    },
    [],
  );

  const handlePrimaryClubKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;

      event.preventDefault();
      submitFilters();
    },
    [submitFilters],
  );

  const cityHelperText = !selectedCountryId
    ? 'Select a country to enable cities.'
    : isCitiesPending
      ? 'Loading cities...'
      : citiesError
        ? citiesError
        : mergedCityOptions.length === 0
          ? 'No cities available for the selected country.'
          : undefined;

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.STADIUMS}>
      <Grid gap={8} columns={6} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={handleSelectChange}
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
          onChange={handleSelectChange}
        >
          <option value='all'>All</option>
          <option value='public'>Public</option>
          <option value='private'>Private</option>
        </Select>
        <Select
          label='Country'
          name='country_id'
          value={selectedCountryId}
          onChange={handleCountryChange}
        >
          <option value=''>All countries</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </Select>
        <Select
          label='City'
          name='city_id'
          value={selectedCityId}
          onChange={handleCityChange}
          disabled={!selectedCountryId || isCitiesPending}
          helperText={cityHelperText}
          error={Boolean(citiesError)}
        >
          <option value=''>All cities</option>
          {mergedCityOptions.map(city => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </Select>
        <TextInput
          label='Primary club ID'
          name='primary_club_id'
          placeholder='Club UUID'
          value={primaryClubValue}
          onChange={handlePrimaryClubChange}
          onKeyDown={handlePrimaryClubKeyDown}
        />
        <Grid display='flex' gap={8} alignItems='center'>
          <Button type='submit' variant='borderless'>
            Apply
          </Button>
          <Button href={NAVIGATION.STADIUMS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
