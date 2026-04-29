/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCity } from '@/_actions/city/createCity';
import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { updateCity } from '@/_actions/city/updateCity';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import NAVIGATION from '@/_constants/navigation';
import type { City, CityActionState } from '@/_types/city';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';

const INITIAL_ACTION_STATE: CityActionState = { status: 'idle' };

function toStringValue(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toString() : '';
}

type CityFormProps = Readonly<{
  city?: City | null;
  countries: ReadonlyArray<CountrySelectOption>;
  edit?: boolean;
  initialCountryId?: string | null;
  initialCountryLabel?: string | null;
}>;

export default function CityForm({
  city,
  countries,
  edit = false,
  initialCountryId = null,
  initialCountryLabel = null,
}: CityFormProps) {
  const router = useRouter();
  const [selectedCountryId, setSelectedCountryId] = useState(
    city?.countryId ?? initialCountryId ?? '',
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState(
    city?.provinceName ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(city?.id ?? '');
  const [provinceOptions, setProvinceOptions] = useState<
    ReadonlyArray<ProvinceAdmin>
  >([]);
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<City>>([]);
  const [isProvincesPending, setIsProvincesPending] = useState(false);
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [provincesError, setProvincesError] = useState('');
  const [citiesError, setCitiesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    CityActionState,
    FormData
  >(updateCity, INITIAL_ACTION_STATE);
  const [createState, createAction, createPending] = useActionState<
    CityActionState,
    FormData
  >(createCity, INITIAL_ACTION_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const pending = edit ? editPending : createPending;

  const selectedCountryLabel = city?.countryName ?? initialCountryLabel;
  const countryOptions = useMemo(() => {
    if (
      !selectedCountryId ||
      countries.some(country => country.id === selectedCountryId)
    ) {
      return countries;
    }

    return [
      {
        id: selectedCountryId,
        name: selectedCountryLabel ?? selectedCountryId,
      },
      ...countries,
    ];
  }, [countries, selectedCountryId, selectedCountryLabel]);
  const hasCountryOptions = countryOptions.length > 0;
  const selectedCity =
    cityOptions.find(option => option.id === selectedCityId) ??
    (city?.id === selectedCityId ? city : null);
  const formFieldsKey = `${selectedCountryId}:${selectedProvinceName}:${selectedCityId || 'new'}`;

  const handleCancel = useCallback(() => {
    if (globalThis?.window?.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.CITIES);
  }, [router]);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error' && actionState.error) {
      toast.error(
        actionState.error.error ||
          actionState.error.message ||
          'We could not save the city.',
      );
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

  useEffect(() => {
    let cancelled = false;

    async function loadProvinces(): Promise<void> {
      if (!selectedCountryId) {
        setProvinceOptions([]);
        setSelectedProvinceName('');
        setCityOptions([]);
        setSelectedCityId('');
        setProvincesError('');
        setCitiesError('');
        setIsProvincesPending(false);
        setIsCitiesPending(false);
        return;
      }

      setIsProvincesPending(true);
      setProvincesError('');

      try {
        const provinces = await getAdminProvincesByCountryId(selectedCountryId);
        if (cancelled) return;

        setProvinceOptions(provinces);
        if (
          selectedProvinceName &&
          !provinces.some(province => province.name === selectedProvinceName)
        ) {
          setSelectedProvinceName('');
          setSelectedCityId('');
          setCityOptions([]);
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to load admin provinces for city form', error);
        setProvinceOptions([]);
        setSelectedProvinceName('');
        setSelectedCityId('');
        setCityOptions([]);
        setProvincesError('We could not load provinces for the selected country.');
      } finally {
        if (!cancelled) setIsProvincesPending(false);
      }
    }

    void loadProvinces();
    return () => {
      cancelled = true;
    };
  }, [selectedCountryId, selectedProvinceName]);

  useEffect(() => {
    let cancelled = false;

    async function loadCities(): Promise<void> {
      if (!selectedCountryId || !selectedProvinceName) {
        setCityOptions([]);
        setSelectedCityId(currentCityId => (edit ? currentCityId : ''));
        setCitiesError('');
        setIsCitiesPending(false);
        return;
      }

      setIsCitiesPending(true);
      setCitiesError('');

      try {
        const cities = await getAdminCitiesByCountryIdAndProvince(
          selectedCountryId,
          selectedProvinceName,
        );
        if (cancelled) return;

        setCityOptions(cities);
        setSelectedCityId(currentCityId =>
          currentCityId && cities.some(option => option.id === currentCityId)
            ? currentCityId
            : '',
        );
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to load admin cities for city form', error);
        setCityOptions([]);
        setSelectedCityId('');
        setCitiesError('We could not load cities for the selected province.');
      } finally {
        if (!cancelled) setIsCitiesPending(false);
      }
    }

    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [edit, selectedCountryId, selectedProvinceName]);

  const isSubmitDisabled =
    pending ||
    !hasCountryOptions ||
    !selectedCountryId ||
    !selectedProvinceName ||
    !selectedCityId;

  const handleCountryChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryId(event.target.value);
    setSelectedProvinceName('');
    setSelectedCityId('');
    setProvinceOptions([]);
    setCityOptions([]);
    setProvincesError('');
    setCitiesError('');
  }, []);

  const handleProvinceChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvinceName(event.target.value);
    setSelectedCityId('');
    setCityOptions([]);
    setCitiesError('');
  }, []);

  const handleCityChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
  }, []);

  return (
    <Form action={formAction}>
      {edit && city ? <input type='hidden' name='cityId' value={city.id} /> : null}
      <input type='hidden' name='countryId' value={selectedCountryId} />
      <input
        type='hidden'
        name='provinceName'
        value={selectedCity?.provinceName ?? selectedProvinceName}
      />
      {!edit ? <input type='hidden' name='name' value={selectedCity?.name ?? ''} /> : null}
      {!edit ? (
        <input
          type='hidden'
          name='regionName'
          value={selectedCity?.regionName ?? ''}
        />
      ) : null}
      {!edit ? (
        <input
          type='hidden'
          name='latitude'
          value={toStringValue(selectedCity?.latitude)}
        />
      ) : null}
      {!edit ? (
        <input
          type='hidden'
          name='longitude'
          value={toStringValue(selectedCity?.longitude)}
        />
      ) : null}
      {!edit ? (
        <input
          type='hidden'
          name='isActive'
          value={selectedCity?.isActive ? 'true' : 'false'}
        />
      ) : null}

      <Section>
        <Grid gap={8} columns={edit ? 3 : 1}>
          <Select
            label='Country'
            value={selectedCountryId}
            onChange={handleCountryChange}
            required
            disabled={edit || pending || !hasCountryOptions}
          >
            <option value=''>Select a country</option>
            {countryOptions.map(country => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>
          <Select
            label='Province'
            value={selectedProvinceName}
            onChange={handleProvinceChange}
            required
            disabled={edit || pending || !selectedCountryId || isProvincesPending}
          >
            <option value=''>Select a province</option>
            {provinceOptions.map(province => (
              <option key={province.name} value={province.name}>
                {province.name}
              </option>
            ))}
          </Select>
          <Select
            label='City'
            value={selectedCityId}
            onChange={handleCityChange}
            required
            disabled={
              edit ||
              pending ||
              !selectedCountryId ||
              !selectedProvinceName ||
              isCitiesPending
            }
          >
            <option value=''>Select a city</option>
            {cityOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </Grid>

        {provincesError ? (
          <Text size='small' color='gray'>
            {provincesError}
          </Text>
        ) : null}
        {citiesError ? (
          <Text size='small' color='gray'>
            {citiesError}
          </Text>
        ) : null}
        {!provincesError &&
        selectedCountryId &&
        !isProvincesPending &&
        provinceOptions.length === 0 ? (
          <Text size='small' color='gray'>
            No provinces found for the selected country.
          </Text>
        ) : null}
        {!citiesError &&
        selectedCountryId &&
        selectedProvinceName &&
        !isCitiesPending &&
        cityOptions.length === 0 ? (
          <Text size='small' color='gray'>
            No cities found for the selected province.
          </Text>
        ) : null}

        {edit ? (
          <Grid key={formFieldsKey} gap={8} columns={2}>
            <TextInput
              label='Name'
              name='name'
              placeholder='Enter city name'
              defaultValue={selectedCity?.name ?? city?.name ?? ''}
              required
              disabled={pending || !selectedCity}
            />
            <TextInput
              label='Region'
              name='regionName'
              placeholder='Enter region (optional)'
              defaultValue={selectedCity?.regionName ?? city?.regionName ?? ''}
              disabled={pending || !selectedCity}
            />
            <TextInput
              label='Latitude'
              name='latitude'
              placeholder='-34.6118'
              defaultValue={toStringValue(selectedCity?.latitude ?? city?.latitude)}
              inputMode='decimal'
              pattern='-?[0-9]*[.,]?[0-9]*'
              disabled={pending || !selectedCity}
            />
            <TextInput
              label='Longitude'
              name='longitude'
              placeholder='-58.3886'
              defaultValue={toStringValue(selectedCity?.longitude ?? city?.longitude)}
              inputMode='decimal'
              pattern='-?[0-9]*[.,]?[0-9]*'
              disabled={pending || !selectedCity}
            />
            <CheckBoxInput
              label='Active'
              name='isActive'
              value='true'
              defaultChecked={selectedCity?.isActive ?? city?.isActive ?? false}
              disabled={pending || !selectedCity}
            />
          </Grid>
        ) : null}

        {edit && city ? (
          <Grid gap={8} columns={2} className='margin-top--16'>
            <TextInput label='ID' defaultValue={city.id} readOnly disabled />
            <TextInput label='Slug' defaultValue={city.slug} readOnly disabled />
            <TextInput
              label='Translation key'
              defaultValue={city.translationKey}
              readOnly
              disabled
              className='grid-column--2'
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4} className='margin-top--24'>
          <Button
            type='submit'
            disabled={isSubmitDisabled}
            aria-busy={pending}
          >
            {pending
              ? edit
                ? 'Updating city...'
                : 'Creating city...'
              : edit
                ? 'Update city'
                : 'Create city'}
          </Button>
          <Button
            type='button'
            onClick={handleCancel}
            variant='borderless'
            kind='primary'
            disabled={pending}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Section>
    </Form>
  );
}
