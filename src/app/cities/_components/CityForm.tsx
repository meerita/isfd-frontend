/** @format */

'use client';
// File: src/app/cities/_components/CityForm.tsx
// Purpose: Form component to create or edit cities
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Text from '@/_components/typography/Text';
import CONTINENTS from '@/_constants/continents';
import NAVIGATION from '@/_constants/navigation';
import { createCity } from '@/_actions/city/createCity';
import { updateCity } from '@/_actions/city/updateCity';
import type { City, CityActionState } from '@/_types/city';
import type { Country } from '@/_types/country';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import LastUpdated from '@/_components/forms/LastUpdated';

const INITIAL_ACTION_STATE: CityActionState = { status: 'idle' };

function toStringValue(value?: number): string {
  return typeof value === 'number' ? value.toString() : '';
}

function sortProvinces(values?: ReadonlyArray<string>): string[] {
  return (values ?? [])
    .map(value => value.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

type CityFormValues = Readonly<{
  name: string;
  countryCode: string;
  countryName: string;
  continent: City['continent'] | '';
  province: string;
  latitude: string;
  longitude: string;
  capital: boolean;
}>;

type CityCountryOption = Readonly<
  Pick<Country, 'id' | 'name' | 'countryCode' | 'continent' | 'provinces'>
>;

type CityFormProps = Readonly<{
  city?: City | null;
  countries: ReadonlyArray<CityCountryOption>;
  edit?: boolean;
  initialCountryCode?: string | null;
}>;

function buildInitialValues(city?: City | null): CityFormValues {
  return {
    name: city?.name ?? '',
    countryCode: city?.countryCode ?? '',
    countryName: city?.country ?? '',
    continent: city?.continent ?? '',
    province: city?.province ?? '',
    latitude: toStringValue(city?.coordinates?.lat ?? city?.latitude),
    longitude: toStringValue(city?.coordinates?.lng ?? city?.longitude),
    capital: Boolean(city?.capital),
  } satisfies CityFormValues;
}

export default function CityForm({
  city,
  countries,
  edit = false,
  initialCountryCode = null,
}: CityFormProps) {
  const router = useRouter();
  const initialValues = buildInitialValues(city);
  const normalizedInitialCountryCode =
    initialValues.countryCode || initialCountryCode || '';

  const initialCountryFromProps =
    countries.find(
      country => country.countryCode === normalizedInitialCountryCode,
    ) ?? countries[0];
  const defaultCountryCode =
    normalizedInitialCountryCode || initialCountryFromProps?.countryCode || '';
  const defaultProvinceValue =
    initialValues.province ||
    sortProvinces(initialCountryFromProps?.provinces)[0] ||
    '';
  const defaultContinentValue =
    initialValues.continent ||
    initialCountryFromProps?.continent ||
    CONTINENTS[0].value;
  const lastUpdatedTimestamp = city?.updatedAt ?? city?.createdAt ?? null;
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountryCode);
  const [provinceValue, setProvinceValue] = useState(defaultProvinceValue);
  const [continentValue, setContinentValue] = useState(defaultContinentValue);
  const actionHandler = edit ? updateCity : createCity;
  const [actionState, formAction, pending] = useActionState<
    CityActionState,
    FormData
  >(actionHandler, INITIAL_ACTION_STATE);
  const submitLabel = edit ? 'Update city' : 'Create city';
  const isPending = pending;
  let fallbackCountryOption: CityCountryOption | null = null;
  if (edit && initialValues.countryCode) {
    const existsInCatalog = countries.some(
      country => country.countryCode === initialValues.countryCode,
    );

    if (!existsInCatalog) {
      const fallbackContinent =
        city?.continent ||
        (initialValues.continent ? initialValues.continent : undefined) ||
        countries[0]?.continent ||
        CONTINENTS[0].value;

      fallbackCountryOption = {
        id: `city-${initialValues.countryCode}`,
        name:
          initialValues.countryName ||
          city?.country ||
          city?.name ||
          initialValues.countryCode,
        countryCode: initialValues.countryCode,
        continent: fallbackContinent,
        provinces: city?.province ? [city.province] : [],
      } satisfies CityCountryOption;
    }
  }
  const countryOptions = useMemo(() => {
    const base = [...countries].sort((a, b) => a.name.localeCompare(b.name));
    if (fallbackCountryOption) {
      base.unshift(fallbackCountryOption);
    }
    return base;
  }, [countries, fallbackCountryOption]);
  const hasCountryOptions = countryOptions.length > 0;

  const getCountryByCode = useCallback(
    function getCountryByCode(code: string | undefined) {
      return countryOptions.find(country => country.countryCode === code);
    },
    [countryOptions],
  );

  const selectedCountry = useMemo(
    () => getCountryByCode(selectedCountryCode),
    [getCountryByCode, selectedCountryCode],
  );
  const derivedCountryName = selectedCountry?.name ?? initialValues.countryName;

  const provinceOptions = useMemo(
    () => sortProvinces(selectedCountry?.provinces),
    [selectedCountry?.provinces],
  );
  const hasProvinceOptions = provinceOptions.length > 0;

  const handleCountryChange = useCallback(
    function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
      const nextCode = event.target.value;
      setSelectedCountryCode(nextCode);

      const country = getCountryByCode(nextCode);
      const nextProvinces = sortProvinces(country?.provinces);
      setProvinceValue(nextProvinces[0] ?? '');

      if (country?.continent) {
        setContinentValue(country.continent);
      }
    },
    [getCountryByCode],
  );

  const handleProvinceChange = useCallback(function handleProvinceChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setProvinceValue(event.target.value);
  }, []);

  const handleContinentChange = useCallback(function handleContinentChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setContinentValue(event.target.value as City['continent']);
  }, []);

  const handleCancel = useCallback(
    function handleCancel() {
      if (globalThis?.window?.history.length > 1) {
        router.back();
        return;
      }

      router.push(NAVIGATION.CITIES);
    },
    [router],
  );

  useEffect(() => {
    if (actionState.status === 'idle') {
      return;
    }

    if (actionState.status === 'error' && actionState.error) {
      const errorMessage =
        actionState.error.error ||
        actionState.error.message ||
        'We could not save the city.';
      toast.error(errorMessage);
      return;
    }

    if (actionState.status === 'success') {
      if (edit) {
        toast.success('City updated successfully.');
        return;
      }

      toast.success('City created successfully.');
      handleCancel();
    }
  }, [actionState.error, actionState.status, edit, handleCancel]);

  const isSubmitDisabled =
    isPending || !hasCountryOptions || !selectedCountryCode;

  return (
    <Form action={formAction}>
      {edit && city ? (
        <input type='hidden' name='cityId' value={city.id} />
      ) : null}
      <input type='hidden' name='countryName' value={derivedCountryName} />

      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8}>
            <TextInput
              label='City name'
              name='name'
              placeholder='Enter city name'
              defaultValue={initialValues.name}
              required
              disabled={isPending}
              className='grid-column--2'
            />
          </Grid>
          <Grid gap={8} columns={3}>
            <Select
              label='Country'
              name='countryCode'
              value={selectedCountryCode}
              onChange={handleCountryChange}
              placeholder='Select a country'
              required
              disabled={isPending || !hasCountryOptions}
            >
              {countryOptions.map(country => (
                <option key={country.id} value={country.countryCode}>
                  {country.name}
                </option>
              ))}
            </Select>
            {hasCountryOptions ? null : (
              <Text size='small' color='gray' className='grid-column--2'>
                You need at least one country before creating cities.
              </Text>
            )}
            <Select
              label='Continent'
              name='continent'
              value={continentValue}
              onChange={handleContinentChange}
              placeholder='Select continent'
              required
              disabled={isPending}
            >
              {CONTINENTS.map(continent => (
                <option key={continent.value} value={continent.value}>
                  {continent.label}
                </option>
              ))}
            </Select>
            {hasProvinceOptions ? (
              <Select
                label='Province'
                name='province'
                value={provinceValue}
                onChange={handleProvinceChange}
                placeholder='Select province'
                disabled={isPending}
              >
                {provinceOptions.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </Select>
            ) : (
              <TextInput
                label='Province'
                name='province'
                placeholder='Enter province (optional)'
                value={provinceValue}
                onChange={handleProvinceChange}
                disabled={isPending}
              />
            )}
            <TextInput
              label='Latitude'
              name='latitude'
              placeholder='-58.3886'
              defaultValue={initialValues.latitude}
              inputMode='decimal'
              pattern='-?[0-9]*[.,]?[0-9]*'
              disabled={isPending}
            />
            <TextInput
              label='Longitude'
              name='longitude'
              placeholder='-34.6118'
              defaultValue={initialValues.longitude}
              inputMode='decimal'
              pattern='-?[0-9]*[.,]?[0-9]*'
              disabled={isPending}
            />
          </Grid>
          <CheckBoxInput
            name='capital'
            label='Capital city'
            defaultChecked={initialValues.capital}
            value='true'
            disabled={isPending}
          />
          <ButtonGroup gap={4} className='margin-top--24'>
            <Button
              type='submit'
              disabled={isSubmitDisabled}
              aria-busy={isPending}
            >
              {isPending
                ? edit
                  ? 'Updating city...'
                  : 'Creating city...'
                : submitLabel}
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              variant='borderless'
              kind='primary'
              disabled={isPending}
            >
              Cancel
            </Button>
          </ButtonGroup>
          {lastUpdatedTimestamp ? (
            <LastUpdated
              date={new Date(lastUpdatedTimestamp)}
              className='margin-top--16'
            />
          ) : null}
        </Section>
      </Grid>
    </Form>
  );
}
