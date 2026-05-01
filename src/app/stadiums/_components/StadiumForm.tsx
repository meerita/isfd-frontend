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

import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import { createStadium } from '@/_actions/stadium/createStadium';
import { updateStadium } from '@/_actions/stadium/updateStadium';
import { formatFormerNamesForInput } from '@/_actions/stadium/payload';
import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Line from '@/_components/Line';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { getStadiumSurfaceTypeOptions } from '@/_constants/enums/stadium';
import NAVIGATION from '@/_constants/navigation';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import type { City } from '@/_types/city';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';
import {
  type Stadium,
  type StadiumActionState,
} from '@/_types/stadium';
import Title from '@/_components/typography/Title';

const INITIAL_STATE: StadiumActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type StadiumFormProps = Readonly<{
  stadium?: Stadium | null;
  countries: ReadonlyArray<CountrySelectOption>;
  initialProvinceName?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  countriesError?: string | null;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

export default function StadiumForm({
  stadium,
  countries,
  initialProvinceName = null,
  initialCities = [],
  countriesError = null,
  selectedCountryLabel = null,
  selectedCityLabel = null,
  edit = false,
  cancelHref,
  successHref,
}: StadiumFormProps) {
  const router = useRouter();
  const latestProvincesRequest = useRef(0);
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(
    stadium?.countryId ?? '',
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState(
    initialProvinceName ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(stadium?.cityId ?? '');
  const [provinceOptions, setProvinceOptions] = useState<
    ReadonlyArray<ProvinceAdmin>
  >([]);
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialCities.map(city => ({ id: city.id, name: city.name })),
  );
  const [isProvincesPending, setIsProvincesPending] = useState(false);
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [provincesError, setProvincesError] = useState('');
  const [citiesError, setCitiesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    StadiumActionState,
    FormData
  >(updateStadium, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    StadiumActionState,
    FormData
  >(createStadium, INITIAL_STATE);

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
        name: selectedCountryLabel ?? selectedCountryId,
      },
      ...countries,
    ];
  }, [countries, selectedCountryId, selectedCountryLabel]);

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

  const loadProvincesForCountry = useCallback(async (countryId: string) => {
    const requestId = latestProvincesRequest.current + 1;
    latestProvincesRequest.current = requestId;

    if (!countryId) {
      setProvinceOptions([]);
      setProvincesError('');
      setIsProvincesPending(false);
      return;
    }

    setIsProvincesPending(true);
    setProvincesError('');

    try {
      const provinces = await getAdminProvincesByCountryId(countryId);
      if (latestProvincesRequest.current !== requestId) return;

      setProvinceOptions(provinces);
      setProvincesError('');
    } catch (error) {
      if (latestProvincesRequest.current !== requestId) return;

      console.error('Failed to load provinces for the selected country', error);
      setProvinceOptions([]);
      setProvincesError('We could not load provinces for the selected country.');
    } finally {
      if (latestProvincesRequest.current === requestId) {
        setIsProvincesPending(false);
      }
    }
  }, []);

  const loadCitiesForCountryAndProvince = useCallback(
    async (countryId: string, provinceName: string) => {
      const requestId = latestCitiesRequest.current + 1;
      latestCitiesRequest.current = requestId;

      if (!countryId || !provinceName) {
        setCityOptions([]);
        setCitiesError('');
        setIsCitiesPending(false);
        return;
      }

      setIsCitiesPending(true);
      setCitiesError('');

      try {
        const cities = await getAdminCitiesByCountryIdAndProvince(
          countryId,
          provinceName,
        );
        if (latestCitiesRequest.current !== requestId) return;

        setCityOptions(cities.map(city => ({ id: city.id, name: city.name })));
        setCitiesError('');
      } catch (error) {
        if (latestCitiesRequest.current !== requestId) return;

        console.error('Failed to load cities for the selected province', error);
        setCityOptions([]);
        setCitiesError('We could not load cities for the selected province.');
      } finally {
        if (latestCitiesRequest.current === requestId) {
          setIsCitiesPending(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedCountryId) return;

    queueMicrotask(() => {
      void loadProvincesForCountry(selectedCountryId);
    });
  }, [loadProvincesForCountry, selectedCountryId]);

  useEffect(() => {
    if (!selectedCountryId || !selectedProvinceName) return;

    queueMicrotask(() => {
      void loadCitiesForCountryAndProvince(
        selectedCountryId,
        selectedProvinceName,
      );
    });
  }, [
    loadCitiesForCountryAndProvince,
    selectedCountryId,
    selectedProvinceName,
  ]);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveStadiumErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Stadium updated successfully.');
      router.push(successHref ?? NAVIGATION.STADIUM_BY_ID(stadium?.id ?? ''));
      router.refresh();
      return;
    }

    toast.success('Stadium created successfully.');
    if (actionState.stadiumId) {
      router.push(NAVIGATION.STADIUM_BY_ID(actionState.stadiumId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.STADIUMS);
    router.refresh();
  }, [
    actionState.error,
    actionState.stadiumId,
    actionState.status,
    edit,
    router,
    stadium?.id,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    if (
      globalThis.window?.history.length &&
      globalThis.window.history.length > 1
    ) {
      router.back();
      return;
    }

    router.push(NAVIGATION.STADIUMS);
  }, [cancelHref, router]);

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextCountryId = event.target.value;
      setSelectedCountryId(nextCountryId);
      setSelectedProvinceName('');
      setSelectedCityId('');
      setProvinceOptions([]);
      setCityOptions([]);
      setProvincesError('');
      setCitiesError('');
    },
    [],
  );

  const handleProvinceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedProvinceName(event.target.value);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');
    },
    [],
  );

  const handleCityChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCityId(event.target.value);
    },
    [],
  );

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? 'Countries are currently unavailable.'
      : undefined;

  const provinceHelperText = !selectedCountryId
    ? 'Select a country to enable provinces.'
    : isProvincesPending
      ? 'Loading provinces...'
      : provincesError
        ? provincesError
        : provinceSelectOptions.length === 0
          ? 'No provinces available for the selected country.'
          : undefined;

  const cityHelperText = !selectedCountryId
    ? 'Select a country to enable cities.'
    : !selectedProvinceName
      ? 'Select a province to enable cities.'
      : isCitiesPending
        ? 'Loading cities...'
        : citiesError
          ? citiesError
          : mergedCityOptions.length === 0
            ? 'No cities available for the selected province.'
            : undefined;

  return (
    <Form action={formAction}>
      {edit && stadium ? (
        <>
          <input type='hidden' name='stadiumId' value={stadium.id} />
          <input
            type='hidden'
            name='original_surfaceType'
            value={stadium.surfaceType ?? ''}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={16}>
          <Grid gap={16} columns={2}>
            <Section>
              <Title size='small'>Stadium Information</Title>
              <FieldSet>
                <Grid gap={8} columns={2}>
                  <TextInput
                    label='Stadium name'
                    name='name'
                    placeholder='e.g. Wembley Stadium'
                    defaultValue={stadium?.name ?? ''}
                    required
                    disabled={isPending}
                  />
                  <Select
                    label='Surface type'
                    name='surfaceType'
                    defaultValue={stadium?.surfaceType ?? ''}
                    disabled={isPending}
                  >
                    <option value=''>No surface type</option>
                    {getStadiumSurfaceTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <TextInput
                    label='Seat count'
                    name='seatCount'
                    type='number'
                    min='0'
                    step='1'
                    placeholder='Optional seat count'
                    defaultValue={stadium?.seatCount?.toString() ?? ''}
                    disabled={isPending}
                  />
                  <TextInput
                    label='Primary club ID'
                    name='primaryClubId'
                    placeholder='Optional club UUID'
                    defaultValue={stadium?.primaryClubId ?? ''}
                    disabled={isPending}
                  />
                  <TextInput
                    label='Image URL'
                    name='imageUrl'
                    type='url'
                    placeholder='https://...'
                    defaultValue={stadium?.imageUrl ?? ''}
                    disabled={isPending}
                    className='grid-column--2'
                  />
                  <TextArea
                    label='Former names'
                    name='formerNames'
                    placeholder='One former name per line'
                    defaultValue={formatFormerNamesForInput(stadium?.formerNames)}
                    disabled={isPending}
                    rows={5}
                    className='grid-column--2'
                    helperText='Optional. Use one former name per line.'
                  />
                  <CheckBoxInput
                    label='Active'
                    name='isActive'
                    value='true'
                    defaultChecked={stadium?.isActive ?? true}
                    disabled={isPending}
                  />
                </Grid>
              </FieldSet>
            </Section>

            <Section>
              <Title size='small'>Location</Title>
              <FieldSet>
                <Grid gap={8} columns={2}>
                  <Select
                    label='Country'
                    name='countryId'
                    value={selectedCountryId}
                    onChange={handleCountryChange}
                    disabled={isPending || Boolean(countriesError)}
                    helperText={countryHelperText}
                    error={Boolean(countriesError)}
                  >
                    <option value=''>No country</option>
                    {countryOptions.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                      ))}
                    </Select>
                  <Select
                    label='Province'
                    name='provinceName'
                    value={selectedProvinceName}
                    onChange={handleProvinceChange}
                    disabled={isPending || !selectedCountryId || isProvincesPending}
                    helperText={provinceHelperText}
                    error={Boolean(provincesError)}
                  >
                    <option value=''>No province</option>
                    {provinceSelectOptions.map(province => (
                      <option key={province.name} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label='City'
                    name='cityId'
                    value={selectedCityId}
                    onChange={handleCityChange}
                    disabled={
                      isPending ||
                      !selectedCountryId ||
                      !selectedProvinceName ||
                      isCitiesPending
                    }
                    helperText={cityHelperText}
                    error={Boolean(citiesError)}
                    className='grid-column--2'
                  >
                    <option value=''>No city</option>
                    {mergedCityOptions.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </Grid>
              </FieldSet>

              {edit && stadium ? (
                <>
                  <Line />
                  <FieldSet>
                    <Grid gap={8} columns={2}>
                      <TextInput
                        label='ID'
                        defaultValue={stadium.id}
                        readOnly
                        disabled
                      />
                      <TextInput
                        label='Slug'
                        defaultValue={stadium.slug}
                        readOnly
                        disabled
                      />
                      <TextInput
                        label='Created at'
                        defaultValue={formatDateTime(stadium.createdAt)}
                        readOnly
                        disabled
                      />
                      <TextInput
                        label='Updated at'
                        defaultValue={formatDateTime(stadium.updatedAt)}
                        readOnly
                        disabled
                      />
                    </Grid>
                  </FieldSet>
                </>
              ) : null}
            </Section>
          </Grid>

          <ButtonGroup gap={4}>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending
                ? edit
                  ? 'Updating stadium...'
                  : 'Creating stadium...'
                : edit
                  ? 'Update stadium'
                  : 'Create stadium'}
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              disabled={isPending}
              variant='borderless'
            >
              Cancel
            </Button>
          </ButtonGroup>
        </Grid>
      </Card>
    </Form>
  );
}
