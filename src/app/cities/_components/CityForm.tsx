/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCity } from '@/_actions/city/createCity';
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
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import type { City, CityActionState } from '@/_types/city';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';

const INITIAL_STATE: CityActionState = { status: 'idle' };

function toStringValue(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toString() : '';
}

type CityFormProps = Readonly<{
  city?: City | null;
  countries: ReadonlyArray<CountrySelectOption>;
  initialCountryId?: string | null;
  initialCountryLabel?: string | null;
  initialProvinces?: ReadonlyArray<ProvinceAdmin>;
  edit?: boolean;
}>;

export default function CityForm({
  city,
  countries,
  initialCountryId = null,
  initialCountryLabel = null,
  initialProvinces = [],
  edit = false,
}: CityFormProps) {
  const router = useRouter();
  const latestProvincesRequest = useRef(0);
  const [selectedCountryId, setSelectedCountryId] = useState(
    city?.countryId ?? initialCountryId ?? '',
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState(
    city?.provinceName ?? '',
  );
  const [provinceOptions, setProvinceOptions] = useState<
    ReadonlyArray<ProvinceAdmin>
  >(initialProvinces);
  const [isProvincesPending, setIsProvincesPending] = useState(false);
  const [provincesError, setProvincesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    CityActionState,
    FormData
  >(updateCity, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CityActionState,
    FormData
  >(createCity, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

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
        name: initialCountryLabel ?? city?.countryName ?? selectedCountryId,
      },
      ...countries,
    ];
  }, [
    city?.countryName,
    countries,
    initialCountryLabel,
    selectedCountryId,
  ]);

  const provinceSelectOptions = useMemo(() => {
    if (
      !selectedProvinceName ||
      provinceOptions.some(province => province.name === selectedProvinceName)
    ) {
      return provinceOptions;
    }

    return [
      {
        name: selectedProvinceName,
        activeCityCount: 0,
        inactiveCityCount: 0,
      },
      ...provinceOptions,
    ];
  }, [provinceOptions, selectedProvinceName]);

  useEffect(() => {
    if (!edit || !selectedCountryId) return;

    const requestId = latestProvincesRequest.current + 1;
    latestProvincesRequest.current = requestId;

    queueMicrotask(() => {
      if (latestProvincesRequest.current !== requestId) return;

      setIsProvincesPending(true);
      setProvincesError('');

      void getAdminProvincesByCountryId(selectedCountryId)
        .then(provinces => {
          if (latestProvincesRequest.current !== requestId) return;
          setProvinceOptions(provinces);
          setProvincesError('');
        })
        .catch(() => {
          if (latestProvincesRequest.current !== requestId) return;
          setProvinceOptions([]);
          setProvincesError(
            'We could not load provinces for the selected country.',
          );
        })
        .finally(() => {
          if (latestProvincesRequest.current === requestId) {
            setIsProvincesPending(false);
          }
        });
    });
  }, [edit, selectedCountryId]);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveCityErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('City updated successfully.');
      router.refresh();
      return;
    }

    toast.success('City created successfully.');
    if (actionState.cityId) {
      router.push(NAVIGATION.CITY_BY_ID(actionState.cityId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.CITIES);
    router.refresh();
  }, [actionState.cityId, actionState.error, actionState.status, edit, router]);

  const handleCancel = useCallback(() => {
    if (
      globalThis.window?.history.length &&
      globalThis.window.history.length > 1
    ) {
      router.back();
      return;
    }

    router.push(NAVIGATION.CITIES);
  }, [router]);

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      latestProvincesRequest.current += 1;
      setSelectedCountryId(event.target.value);
      setSelectedProvinceName('');
      setProvinceOptions([]);
      setProvincesError('');
      setIsProvincesPending(false);
    },
    [],
  );

  const countryHelperText =
    countryOptions.length === 0 ? 'Countries are currently unavailable.' : undefined;

  const provinceHelperText = !selectedCountryId
    ? 'Select a country to enable provinces.'
    : isProvincesPending
      ? 'Loading provinces...'
      : provincesError
        ? provincesError
        : provinceSelectOptions.length === 0
          ? 'No provinces available for the selected country.'
          : undefined;

  return (
    <Form action={formAction}>
      {edit && city ? (
        <>
          <input type='hidden' name='cityId' value={city.id} />
          <input
            type='hidden'
            name='original_countryId'
            value={city.countryId}
          />
          <input type='hidden' name='original_name' value={city.name} />
          <input
            type='hidden'
            name='original_regionName'
            value={city.regionName ?? ''}
          />
          <input
            type='hidden'
            name='original_provinceName'
            value={city.provinceName ?? ''}
          />
          <input
            type='hidden'
            name='original_latitude'
            value={toStringValue(city.latitude)}
          />
          <input
            type='hidden'
            name='original_longitude'
            value={toStringValue(city.longitude)}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={city.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Section>
        <Grid gap={8} columns={2}>
          <Select
            label='Country'
            name='countryId'
            value={selectedCountryId}
            onChange={handleCountryChange}
            required
            disabled={isPending || countryOptions.length === 0}
            helperText={countryHelperText}
          >
            <option value=''>Select a country</option>
            {countryOptions.map(country => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>
          {edit ? (
            <Select
              label='Province'
              name='provinceName'
              value={selectedProvinceName}
              onChange={event => {
                setSelectedProvinceName(event.target.value);
              }}
              disabled={isPending || !selectedCountryId || isProvincesPending}
              helperText={provinceHelperText}
            >
              <option value=''>— none —</option>
              {provinceSelectOptions.map(province => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </Select>
          ) : null}
          <TextInput
            label='City name'
            name='name'
            placeholder='e.g. Madrid'
            defaultValue={city?.name ?? ''}
            required
            disabled={isPending}
          />
          {edit ? (
            <>
              <TextInput
                label='Region'
                name='regionName'
                placeholder='Optional region'
                defaultValue={city?.regionName ?? ''}
                disabled={isPending}
              />
              <TextInput
                label='Latitude'
                name='latitude'
                placeholder='40.4168'
                defaultValue={toStringValue(city?.latitude)}
                inputMode='decimal'
                pattern='-?[0-9]*[.,]?[0-9]*'
                disabled={isPending}
              />
              <TextInput
                label='Longitude'
                name='longitude'
                placeholder='-3.7038'
                defaultValue={toStringValue(city?.longitude)}
                inputMode='decimal'
                pattern='-?[0-9]*[.,]?[0-9]*'
                disabled={isPending}
              />
            </>
          ) : null}
          {edit ? (
            <CheckBoxInput
              label='Active'
              name='isActive'
              value='true'
              defaultChecked={city?.isActive ?? false}
              disabled={isPending}
            />
          ) : null}
        </Grid>

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
            disabled={isPending || !selectedCountryId || countryOptions.length === 0}
            aria-busy={isPending}
          >
            {isPending
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
            disabled={isPending}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Section>
    </Form>
  );
}
