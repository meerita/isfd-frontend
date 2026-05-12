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
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import { createPerson } from '@/_actions/person/createPerson';
import { formatDateForInput } from '@/_actions/person/payload';
import { updatePerson } from '@/_actions/person/updatePerson';
import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Line from '@/_components/Line';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Title from '@/_components/typography/Title';
import {
  getPersonCurrentProfessionOptions,
  getPersonDominantFootOptions,
  getPersonEthnicityOptions,
  getPersonGenderOptions,
  getPersonHairColorOptions,
  getPersonSkinColorOptions,
} from '@/_constants/enums/person';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';
import type { City } from '@/_types/city';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';
import type { PersonActionState, PersonAdminDetail } from '@/_types/person';

const INITIAL_STATE: PersonActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type PersonLocationSelection = Readonly<{
  countryId?: string | null;
  countryLabel?: string | null;
  provinceName?: string | null;
  cityId?: string | null;
  cityLabel?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
}>;

type PersonFormValues = {
  full_name: string;
  display_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  second_surname: string;
  known_as: string;
  native_full_name: string;
  birth_date: string;
  death_date: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  hair_color: string;
  ethnicity: string;
  skin_color: string;
  primary_nationality_country_id: string;
  current_profession: string;
  dominant_foot: string;
  professional_division_debut_date: string;
  retirement_date: string;
  portrait_asset_id: string;
  is_deceased: boolean;
  is_public: boolean;
};

type PersonStringField = Exclude<
  keyof PersonFormValues,
  'is_deceased' | 'is_public'
>;
type PersonBooleanField = Extract<
  keyof PersonFormValues,
  'is_deceased' | 'is_public'
>;

type LocationSelectorTexts = Readonly<{
  countriesUnavailable: string;
  noCountry: string;
  noProvince: string;
  noCity: string;
  selectCountryToEnableProvinces: string;
  loadingProvinces: string;
  provincesLoadError: string;
  noProvincesAvailable: string;
  selectCountryToEnableCities: string;
  selectProvinceToEnableCities: string;
  loadingCities: string;
  citiesLoadError: string;
  noCitiesAvailable: string;
}>;

type PersonFormProps = Readonly<{
  person?: PersonAdminDetail | null;
  countries: ReadonlyArray<CountrySelectOption>;
  countriesError?: string | null;
  selectedPrimaryNationalityCountryLabel?: string | null;
  initialBirthLocation?: PersonLocationSelection;
  initialCurrentLocation?: PersonLocationSelection;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

function formatDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return parsed.toLocaleString(locale);
}

function formatNumberForInput(value: number | null | undefined): string {
  return typeof value === 'number' ? String(value) : '';
}

function serializeFormData(
  formData: FormData,
): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function createInitialValues(
  person?: PersonAdminDetail | null,
): PersonFormValues {
  return {
    full_name: person?.full_name ?? '',
    display_name: person?.display_name ?? '',
    first_name: person?.first_name ?? '',
    middle_name: person?.middle_name ?? '',
    last_name: person?.last_name ?? '',
    second_surname: person?.second_surname ?? '',
    known_as: person?.known_as ?? '',
    native_full_name: person?.native_full_name ?? '',
    birth_date: formatDateForInput(person?.birth_date),
    death_date: formatDateForInput(person?.death_date),
    gender: person?.gender ?? '',
    height_cm: formatNumberForInput(person?.height_cm),
    weight_kg: formatNumberForInput(person?.weight_kg),
    hair_color: person?.hair_color ?? '',
    ethnicity: person?.ethnicity ?? '',
    skin_color: person?.skin_color ?? '',
    primary_nationality_country_id: person?.primary_nationality_country_id ?? '',
    current_profession: person?.current_profession ?? '',
    dominant_foot: person?.dominant_foot ?? '',
    professional_division_debut_date: formatDateForInput(
      person?.professional_division_debut_date,
    ),
    retirement_date: formatDateForInput(person?.retirement_date),
    portrait_asset_id: person?.portrait_asset_id ?? '',
    is_deceased: person?.is_deceased ?? false,
    is_public: person?.is_public ?? true,
  };
}

function OriginalField({
  name,
  value,
}: Readonly<{
  name: string;
  value: string;
}>): React.JSX.Element {
  return <input type='hidden' name={`original_${name}`} value={value} />;
}

function useCityLocationSelector({
  countries,
  countriesError,
  initialSelection,
  texts,
}: Readonly<{
  countries: ReadonlyArray<CountrySelectOption>;
  countriesError: string | null;
  initialSelection?: PersonLocationSelection;
  texts: LocationSelectorTexts;
}>) {
  const latestProvincesRequest = useRef(0);
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(
    initialSelection?.countryId ?? '',
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState(
    initialSelection?.provinceName ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(
    initialSelection?.cityId ?? '',
  );
  const [provinceOptions, setProvinceOptions] = useState<
    ReadonlyArray<ProvinceAdmin>
  >([]);
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialSelection?.initialCities?.map(city => ({
      id: city.id,
      name: city.name,
    })) ?? [],
  );
  const [isProvincesPending, setIsProvincesPending] = useState(false);
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [provincesError, setProvincesError] = useState('');
  const [citiesError, setCitiesError] = useState('');

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
        name: initialSelection?.countryLabel ?? selectedCountryId,
      },
      ...countries,
    ];
  }, [countries, initialSelection?.countryLabel, selectedCountryId]);

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
        name: initialSelection?.cityLabel ?? selectedCityId,
      },
      ...cityOptions,
    ];
  }, [cityOptions, initialSelection?.cityLabel, selectedCityId]);

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
      if (latestProvincesRequest.current !== requestId) {
        return;
      }

      setProvinceOptions(provinces);
      setProvincesError('');
    } catch (error) {
      if (latestProvincesRequest.current !== requestId) {
        return;
      }

      console.error('Failed to load provinces for the selected country', error);
      setProvinceOptions([]);
      setProvincesError(texts.provincesLoadError);
    } finally {
      if (latestProvincesRequest.current === requestId) {
        setIsProvincesPending(false);
      }
    }
  }, [texts.provincesLoadError]);

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
        if (latestCitiesRequest.current !== requestId) {
          return;
        }

        setCityOptions(cities.map(city => ({ id: city.id, name: city.name })));
        setCitiesError('');
      } catch (error) {
        if (latestCitiesRequest.current !== requestId) {
          return;
        }

        console.error('Failed to load cities for the selected province', error);
        setCityOptions([]);
        setCitiesError(texts.citiesLoadError);
      } finally {
        if (latestCitiesRequest.current === requestId) {
          setIsCitiesPending(false);
        }
      }
    },
    [texts.citiesLoadError],
  );

  useEffect(() => {
    if (!selectedCountryId) {
      return;
    }

    queueMicrotask(() => {
      void loadProvincesForCountry(selectedCountryId);
    });
  }, [loadProvincesForCountry, selectedCountryId]);

  useEffect(() => {
    if (!selectedCountryId || !selectedProvinceName) {
      return;
    }

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

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      latestProvincesRequest.current += 1;
      latestCitiesRequest.current += 1;

      setSelectedCountryId(event.target.value);
      setSelectedProvinceName('');
      setSelectedCityId('');
      setProvinceOptions([]);
      setCityOptions([]);
      setProvincesError('');
      setCitiesError('');
      setIsProvincesPending(false);
      setIsCitiesPending(false);
    },
    [],
  );

  const handleProvinceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      latestCitiesRequest.current += 1;

      setSelectedProvinceName(event.target.value);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');
      setIsCitiesPending(false);
    },
    [],
  );

  const handleCityChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setSelectedCityId(event.target.value);
    },
    [],
  );

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? texts.countriesUnavailable
      : undefined;

  const provinceHelperText = !selectedCountryId
    ? texts.selectCountryToEnableProvinces
    : isProvincesPending
      ? texts.loadingProvinces
      : provincesError
        ? provincesError
        : provinceSelectOptions.length === 0
          ? texts.noProvincesAvailable
          : undefined;

  const cityHelperText = !selectedCountryId
    ? texts.selectCountryToEnableCities
    : !selectedProvinceName
      ? texts.selectProvinceToEnableCities
      : isCitiesPending
        ? texts.loadingCities
        : citiesError
          ? citiesError
          : mergedCityOptions.length === 0
            ? texts.noCitiesAvailable
            : undefined;

  return {
    selectedCountryId,
    selectedProvinceName,
    selectedCityId,
    countryOptions,
    provinceSelectOptions,
    mergedCityOptions,
    isProvincesPending,
    isCitiesPending,
    provincesError,
    citiesError,
    countryHelperText,
    provinceHelperText,
    cityHelperText,
    handleCountryChange,
    handleProvinceChange,
    handleCityChange,
    noCountryLabel: texts.noCountry,
    noProvinceLabel: texts.noProvince,
    noCityLabel: texts.noCity,
  };
}

export default function PersonForm({
  person,
  countries,
  countriesError = null,
  selectedPrimaryNationalityCountryLabel = null,
  initialBirthLocation,
  initialCurrentLocation,
  edit = false,
  cancelHref,
  successHref,
}: PersonFormProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary, locale } = useI18n();

  const [values, setValues] = useState<PersonFormValues>(() =>
    createInitialValues(person),
  );

  const [editState, editAction, editPending] = useActionState<
    PersonActionState,
    FormData
  >(updatePerson, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    PersonActionState,
    FormData
  >(createPerson, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  const locationTexts = useMemo(
    (): LocationSelectorTexts => ({
      countriesUnavailable: dictionary.persons.form.countriesUnavailable,
      noCountry: dictionary.persons.form.noCountry,
      noProvince: dictionary.persons.form.noProvince,
      noCity: dictionary.persons.form.noCity,
      selectCountryToEnableProvinces:
        dictionary.persons.form.selectCountryToEnableProvinces,
      loadingProvinces: dictionary.persons.form.loadingProvinces,
      provincesLoadError: dictionary.persons.form.provincesLoadError,
      noProvincesAvailable: dictionary.persons.form.noProvincesAvailable,
      selectCountryToEnableCities:
        dictionary.persons.form.selectCountryToEnableCities,
      selectProvinceToEnableCities:
        dictionary.persons.form.selectProvinceToEnableCities,
      loadingCities: dictionary.persons.form.loadingCities,
      citiesLoadError: dictionary.persons.form.citiesLoadError,
      noCitiesAvailable: dictionary.persons.form.noCitiesAvailable,
    }),
    [dictionary.persons.form],
  );

  const birthLocation = useCityLocationSelector({
    countries,
    countriesError,
    initialSelection: initialBirthLocation,
    texts: locationTexts,
  });
  const currentLocation = useCityLocationSelector({
    countries,
    countriesError,
    initialSelection: initialCurrentLocation,
    texts: locationTexts,
  });

  const primaryNationalityCountryOptions = useMemo(
    function buildCountryOptions() {
      if (
        !values.primary_nationality_country_id ||
        countries.some(
          country => country.id === values.primary_nationality_country_id,
        )
      ) {
        return countries;
      }

      return [
        {
          id: values.primary_nationality_country_id,
          name:
            selectedPrimaryNationalityCountryLabel ??
            values.primary_nationality_country_id,
        },
        ...countries,
      ];
    },
    [
      countries,
      selectedPrimaryNationalityCountryLabel,
      values.primary_nationality_country_id,
    ],
  );

  useEffect(() => {
    if (actionState.status === 'idle') {
      return;
    }

    if (actionState.status === 'error') {
      toast.error(
        resolvePersonErrorMessage(
          actionState.error,
          dictionary.persons.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (edit) {
      toast.success(dictionary.persons.form.updateSuccess);
      router.push(successHref ?? NAVIGATION.PERSON_BY_ID(person?.id ?? ''));
      router.refresh();
      return;
    }

    toast.success(dictionary.persons.form.createSuccess);
    router.push(
      actionState.personId
        ? NAVIGATION.PERSON_BY_ID(actionState.personId)
        : NAVIGATION.PERSONS,
    );
    router.refresh();
  }, [
    actionState.error,
    actionState.personId,
    actionState.status,
    dictionary.common.unexpectedError,
    dictionary.persons.errors,
    dictionary.persons.form.createSuccess,
    dictionary.persons.form.updateSuccess,
    edit,
    person?.id,
    router,
    successHref,
  ]);

  const handleCancel = useCallback((): void => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.PERSONS);
  }, [cancelHref, router]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const field = event.target.name as PersonStringField;
      const nextValue = event.target.value;

      setValues(previousValues => ({
        ...previousValues,
        [field]: nextValue,
      }));
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const field = event.target.name as PersonBooleanField;
      const nextValue = event.target.checked;

      setValues(previousValues => ({
        ...previousValues,
        [field]: nextValue,
      }));
    },
    [],
  );

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    const submittedFormData = new FormData(event.currentTarget);
    console.log(
      `[PersonForm:${edit ? 'edit' : 'create'}] submitted values`,
      serializeFormData(submittedFormData),
    );
  }, [edit]);

  const primaryNationalityHelperText = countriesError
    ? countriesError
    : primaryNationalityCountryOptions.length === 0
      ? dictionary.persons.form.countriesUnavailable
      : undefined;

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      {edit && person ? (
        <>
          <input type='hidden' name='person_id' value={person.id} />
          <OriginalField name='full_name' value={person.full_name} />
          <OriginalField name='first_name' value={person.first_name ?? ''} />
          <OriginalField name='middle_name' value={person.middle_name ?? ''} />
          <OriginalField name='last_name' value={person.last_name ?? ''} />
          <OriginalField
            name='second_surname'
            value={person.second_surname ?? ''}
          />
          <OriginalField name='display_name' value={person.display_name ?? ''} />
          <OriginalField name='known_as' value={person.known_as ?? ''} />
          <OriginalField
            name='native_full_name'
            value={person.native_full_name ?? ''}
          />
          <OriginalField name='gender' value={person.gender ?? ''} />
          <OriginalField name='birth_date' value={person.birth_date ?? ''} />
          <OriginalField name='death_date' value={person.death_date ?? ''} />
          <OriginalField
            name='birth_location_id'
            value={person.birth_location_id ?? ''}
          />
          <OriginalField
            name='current_city_id'
            value={person.current_city_id ?? ''}
          />
          <OriginalField
            name='primary_nationality_country_id'
            value={person.primary_nationality_country_id ?? ''}
          />
          <OriginalField
            name='height_cm'
            value={formatNumberForInput(person.height_cm)}
          />
          <OriginalField
            name='weight_kg'
            value={formatNumberForInput(person.weight_kg)}
          />
          <OriginalField name='hair_color' value={person.hair_color ?? ''} />
          <OriginalField name='ethnicity' value={person.ethnicity ?? ''} />
          <OriginalField name='skin_color' value={person.skin_color ?? ''} />
          <OriginalField
            name='dominant_foot'
            value={person.dominant_foot ?? ''}
          />
          <OriginalField
            name='current_profession'
            value={person.current_profession ?? ''}
          />
          <OriginalField
            name='professional_division_debut_date'
            value={person.professional_division_debut_date ?? ''}
          />
          <OriginalField
            name='retirement_date'
            value={person.retirement_date ?? ''}
          />
          <OriginalField
            name='portrait_asset_id'
            value={person.portrait_asset_id ?? ''}
          />
          <OriginalField
            name='is_deceased'
            value={person.is_deceased ? 'true' : 'false'}
          />
          <OriginalField
            name='is_public'
            value={person.is_public ? 'true' : 'false'}
          />
        </>
      ) : null}

      <input
        type='hidden'
        name='birth_location_id'
        value={birthLocation.selectedCityId}
      />
      <input
        type='hidden'
        name='current_city_id'
        value={currentLocation.selectedCityId}
      />

      <Card>
        <Grid gap={16} columns={2}>
          <Section>
            <Title size='small'>{dictionary.persons.form.identity}</Title>
            <FieldSet>
              <Grid gap={8} columns={4}>
                <TextInput
                  label={dictionary.persons.form.fullName}
                  name='full_name'
                  value={values.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder={dictionary.persons.form.placeholders.fullName}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.displayName}
                  name='display_name'
                  placeholder={dictionary.persons.form.placeholders.displayName}
                  value={values.display_name}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.firstName}
                  name='first_name'
                  placeholder={dictionary.persons.form.placeholders.firstName}
                  value={values.first_name}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.middleName}
                  name='middle_name'
                  placeholder={dictionary.persons.form.placeholders.middleName}
                  value={values.middle_name}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.lastName}
                  name='last_name'
                  placeholder={dictionary.persons.form.placeholders.lastName}
                  value={values.last_name}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.secondSurname}
                  name='second_surname'
                  placeholder={dictionary.persons.form.placeholders.secondSurname}
                  value={values.second_surname}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.knownAs}
                  name='known_as'
                  placeholder={dictionary.persons.form.placeholders.knownAs}
                  value={values.known_as}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.nativeFullName}
                  name='native_full_name'
                  value={values.native_full_name}
                  onChange={handleInputChange}
                  disabled={isPending}
                  placeholder={dictionary.persons.form.placeholders.nativeFullName}
                  className='grid-column--2'
                  title={dictionary.persons.form.titles.nativeFullName}
                />
              </Grid>
            </FieldSet>

            <input type='hidden' name='is_public' value='false' />
            <CheckBoxInput
              label={dictionary.persons.form.activeLabel}
              name='is_public'
              value='true'
              checked={values.is_public}
              onChange={handleCheckboxChange}
              disabled={isPending}
              placeholder={dictionary.persons.form.activeHelper}
            />

            <Line />

            <Title size='small'>{dictionary.persons.form.vitals}</Title>

            <FieldSet>
              <Grid gap={8} columns={4} alignItems='end'>
                <TextInput
                  label={dictionary.persons.form.birthDate}
                  name='birth_date'
                  type='date'
                  value={values.birth_date}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.deathDate}
                  name='death_date'
                  type='date'
                  value={values.death_date}
                  onChange={handleInputChange}
                  disabled={isPending || !values.is_deceased}
                />
                <input type='hidden' name='is_deceased' value='false' />
                <CheckBoxInput
                  label={dictionary.persons.form.deceased}
                  name='is_deceased'
                  value='true'
                  checked={values.is_deceased}
                  onChange={handleCheckboxChange}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.gender}
                  name='gender'
                  value={values.gender}
                  onChange={handleInputChange}
                  disabled={isPending}
                >
                  <option value=''>{dictionary.persons.form.noGender}</option>
                  {getPersonGenderOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <NumberInput
                  label={dictionary.persons.form.heightCm}
                  name='height_cm'
                  type='number'
                  min='0'
                  step='1'
                  value={values.height_cm}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
                <NumberInput
                  label={dictionary.persons.form.weightKg}
                  name='weight_kg'
                  type='number'
                  min='0'
                  step='1'
                  value={values.weight_kg}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.hairColor}
                  name='hair_color'
                  value={values.hair_color}
                  onChange={handleInputChange}
                  disabled={isPending}
                >
                  <option value=''>{dictionary.persons.form.noHairColor}</option>
                  {getPersonHairColorOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label={dictionary.persons.form.ethnicity}
                  name='ethnicity'
                  value={values.ethnicity}
                  onChange={handleInputChange}
                  disabled={isPending}
                >
                  <option value=''>{dictionary.persons.form.noEthnicity}</option>
                  {getPersonEthnicityOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label={dictionary.persons.form.skinColor}
                  name='skin_color'
                  value={values.skin_color}
                  onChange={handleInputChange}
                  disabled={isPending}
                >
                  <option value=''>{dictionary.persons.form.noSkinColor}</option>
                  {getPersonSkinColorOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Grid>
            </FieldSet>
          </Section>

          <Section>
            <Title size='small'>{dictionary.persons.form.background}</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <Title size='small' className='grid-column--2'>
                  {dictionary.persons.form.birthLocation}
                </Title>
                <Select
                  label={dictionary.persons.form.country}
                  value={birthLocation.selectedCountryId}
                  onChange={birthLocation.handleCountryChange}
                  disabled={isPending || Boolean(countriesError)}
                  helperText={birthLocation.countryHelperText}
                  error={Boolean(countriesError)}
                >
                  <option value=''>{birthLocation.noCountryLabel}</option>
                  {birthLocation.countryOptions.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label={dictionary.persons.form.province}
                  value={birthLocation.selectedProvinceName}
                  onChange={birthLocation.handleProvinceChange}
                  disabled={
                    isPending ||
                    !birthLocation.selectedCountryId ||
                    birthLocation.isProvincesPending
                  }
                  helperText={birthLocation.provinceHelperText}
                  error={Boolean(birthLocation.provincesError)}
                >
                  <option value=''>{birthLocation.noProvinceLabel}</option>
                  {birthLocation.provinceSelectOptions.map(province => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label={dictionary.persons.form.city}
                  value={birthLocation.selectedCityId}
                  onChange={birthLocation.handleCityChange}
                  disabled={
                    isPending ||
                    !birthLocation.selectedCountryId ||
                    !birthLocation.selectedProvinceName ||
                    birthLocation.isCitiesPending
                  }
                  helperText={birthLocation.cityHelperText}
                  error={Boolean(birthLocation.citiesError)}
                  className='grid-column--2'
                >
                  <option value=''>{birthLocation.noCityLabel}</option>
                  {birthLocation.mergedCityOptions.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </Grid>
            </FieldSet>

            <Line />

            <FieldSet>
              <Grid gap={8} columns={2}>
                <Title size='small' className='grid-column--2'>
                  {dictionary.persons.form.currentLocation}
                </Title>
                <Select
                  label={dictionary.persons.form.country}
                  value={currentLocation.selectedCountryId}
                  onChange={currentLocation.handleCountryChange}
                  disabled={isPending || Boolean(countriesError)}
                  helperText={currentLocation.countryHelperText}
                  error={Boolean(countriesError)}
                >
                  <option value=''>{currentLocation.noCountryLabel}</option>
                  {currentLocation.countryOptions.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label={dictionary.persons.form.province}
                  value={currentLocation.selectedProvinceName}
                  onChange={currentLocation.handleProvinceChange}
                  disabled={
                    isPending ||
                    !currentLocation.selectedCountryId ||
                    currentLocation.isProvincesPending
                  }
                  helperText={currentLocation.provinceHelperText}
                  error={Boolean(currentLocation.provincesError)}
                >
                  <option value=''>{currentLocation.noProvinceLabel}</option>
                  {currentLocation.provinceSelectOptions.map(province => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label={dictionary.persons.form.city}
                  value={currentLocation.selectedCityId}
                  onChange={currentLocation.handleCityChange}
                  disabled={
                    isPending ||
                    !currentLocation.selectedCountryId ||
                    !currentLocation.selectedProvinceName ||
                    currentLocation.isCitiesPending
                  }
                  helperText={currentLocation.cityHelperText}
                  error={Boolean(currentLocation.citiesError)}
                  className='grid-column--2'
                >
                  <option value=''>{currentLocation.noCityLabel}</option>
                  {currentLocation.mergedCityOptions.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label={dictionary.persons.form.primaryNationalityCountry}
                  name='primary_nationality_country_id'
                  value={values.primary_nationality_country_id}
                  onChange={handleInputChange}
                  disabled={isPending || Boolean(countriesError)}
                  error={Boolean(countriesError)}
                  helperText={primaryNationalityHelperText}
                  title={dictionary.persons.form.primaryNationalityCountryTitle}
                  className='grid-column--2'
                >
                  <option value=''>{dictionary.persons.form.noCountry}</option>
                  {primaryNationalityCountryOptions.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </Grid>
            </FieldSet>

            <Line />

            <Title size='small'>
              {dictionary.persons.form.professionalActivity}
            </Title>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.currentProfession}
                  name='current_profession'
                  value={values.current_profession}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className='grid-column--2'
                >
                  <option value=''>
                    {dictionary.persons.form.noCurrentProfession}
                  </option>
                  {getPersonCurrentProfessionOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label={dictionary.persons.form.dominantFoot}
                  name='dominant_foot'
                  value={values.dominant_foot}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className='grid-column--2'
                >
                  <option value=''>
                    {dictionary.persons.form.noDominantFoot}
                  </option>
                  {getPersonDominantFootOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <TextInput
                  label={dictionary.persons.form.professionalDebutDate}
                  name='professional_division_debut_date'
                  type='date'
                  value={values.professional_division_debut_date}
                  onChange={handleInputChange}
                  disabled={isPending}
                />

                <TextInput
                  label={dictionary.persons.form.retirementDate}
                  name='retirement_date'
                  type='date'
                  value={values.retirement_date}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
          </Section>
        </Grid>
      </Card>

      <Card>
        <Grid gap={16} columns={2}>
          <Section>
            <Title size='small'>{dictionary.persons.form.media}</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <TextInput
                  label={dictionary.persons.form.portraitAssetId}
                  name='portrait_asset_id'
                  placeholder={dictionary.persons.form.placeholders.portraitAssetId}
                  value={values.portrait_asset_id}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
          </Section>

          {edit && person ? (
            <Section>
              <Title size='small'>{dictionary.persons.form.metadata}</Title>
              <FieldSet>
                <Grid gap={8} columns={2}>
                  <TextInput
                    label={dictionary.persons.form.id}
                    value={person.id}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.slug}
                    value={person.slug}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.createdAt}
                    value={formatDateTime(person.created_at, locale)}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.updatedAt}
                    value={formatDateTime(person.updated_at, locale)}
                    readOnly
                    disabled
                  />
                </Grid>
              </FieldSet>
            </Section>
          ) : null}

          <ButtonGroup gap={4}>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending
                ? edit
                  ? dictionary.persons.form.updatePending
                  : dictionary.persons.form.createPending
                : edit
                  ? dictionary.persons.form.updateAction
                  : dictionary.persons.form.createAction}
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              disabled={isPending}
              variant='borderless'
            >
              {dictionary.common.cancel}
            </Button>
          </ButtonGroup>
        </Grid>
      </Card>
    </Form>
  );
}
