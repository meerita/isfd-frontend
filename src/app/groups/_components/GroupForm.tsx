/** @format */

'use client';

// File: src/app/groups/_components/GroupForm.tsx
// Purpose: Form component to create groups with dependent location selectors
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getCities } from '@/_actions/city/getCities';
import { createGroup } from '@/_actions/group/createGroup';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import CONTINENTS from '@/_constants/continents';
import {
  GROUP_JOIN_MODE_OPTIONS,
  GROUP_PRIVACY_OPTIONS,
  GROUP_VISIBILITY_OPTIONS,
} from '@/_constants/groupPreferences';
import NAVIGATION from '@/_constants/navigation';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type {
  GroupActionState,
  GroupJoinMode,
  GroupPrivacy,
  GroupVisibility,
} from '@/_types/group';
import type { Sport } from '@/_types/sport';

const INITIAL_ACTION_STATE: GroupActionState = { status: 'idle' };

type GroupFormValues = Readonly<{
  name: string;
  description: string;
  sportId: string;
  privacy: GroupPrivacy;
  visibility: GroupVisibility;
  joinMode: GroupJoinMode;
  active: boolean;
}>;

type GroupCountryOption = Readonly<
  Pick<
    Country,
    'id' | 'name' | 'localizedName' | 'countryCode' | 'continent' | 'provinces'
  >
>;

type GroupCityOption = Readonly<{
  id: string;
  name: string;
  country: string;
  countryCode: string;
  continent: City['continent'];
  province?: string;
  latitude?: number;
  longitude?: number;
}>;

type GroupFormProps = Readonly<{
  countries: ReadonlyArray<GroupCountryOption>;
  sports: ReadonlyArray<Sport>;
}>;

function buildInitialValues(): GroupFormValues {
  return {
    name: '',
    description: '',
    sportId: '',
    privacy: 'PUBLIC',
    visibility: 'VISIBLE',
    joinMode: 'FREE',
    active: true,
  };
}

function toCityOption(city: City): GroupCityOption {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    continent: city.continent,
    province: city.province,
    latitude: city.coordinates?.lat ?? city.latitude,
    longitude: city.coordinates?.lng ?? city.longitude,
  };
}

function sortCountries(
  countries: ReadonlyArray<GroupCountryOption>,
): ReadonlyArray<GroupCountryOption> {
  return [...countries].sort(function compareCountries(
    countryA: GroupCountryOption,
    countryB: GroupCountryOption,
  ): number {
    return countryA.name.localeCompare(countryB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

function sortSports(sports: ReadonlyArray<Sport>): ReadonlyArray<Sport> {
  return [...sports].sort(function compareSports(
    sportA: Sport,
    sportB: Sport,
  ): number {
    return sportA.name.localeCompare(sportB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

function sortProvinceNames(
  values: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return [...values]
    .map(function normalize(value: string): string {
      return value.trim();
    })
    .filter(Boolean)
    .sort(function compareProvinceNames(
      valueA: string,
      valueB: string,
    ): number {
      return valueA.localeCompare(valueB, 'en', { sensitivity: 'base' });
    });
}

function resolveProvinceSelection(
  provinceOptions: ReadonlyArray<string>,
  currentProvince: string,
): string {
  if (provinceOptions.length === 0) {
    return '';
  }

  if (provinceOptions.includes(currentProvince)) {
    return currentProvince;
  }

  return provinceOptions[0];
}

export default function GroupForm({ countries, sports }: GroupFormProps) {
  const router = useRouter();
  const initialValues = buildInitialValues();
  const [formValues, setFormValues] = useState(initialValues);
  const [selectedContinent, setSelectedContinent] = useState(
    CONTINENTS[0]?.value ?? 'EUROPE',
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cityOptions, setCityOptions] = useState<
    ReadonlyArray<GroupCityOption>
  >([]);
  const [citiesError, setCitiesError] = useState('');
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [actionState, formAction, pending] = useActionState<
    GroupActionState,
    FormData
  >(createGroup, INITIAL_ACTION_STATE);

  const sortedCountries = useMemo(
    function getSortedCountries() {
      return sortCountries(countries);
    },
    [countries],
  );
  const sortedSports = useMemo(
    function getSortedSports() {
      return sortSports(sports);
    },
    [sports],
  );
  const selectedSportId = formValues.sportId || sortedSports[0]?.id || '';
  const filteredCountries = useMemo(
    function getFilteredCountries() {
      return sortedCountries.filter(function filterByContinent(country) {
        return country.continent === selectedContinent;
      });
    },
    [selectedContinent, sortedCountries],
  );
  const resolvedCountryCode = useMemo(
    function getResolvedCountryCode() {
      const hasSelectedCountry = filteredCountries.some(
        function hasCountry(country) {
          return country.countryCode === selectedCountryCode;
        },
      );

      if (hasSelectedCountry) {
        return selectedCountryCode;
      }

      return filteredCountries[0]?.countryCode ?? '';
    },
    [filteredCountries, selectedCountryCode],
  );
  const selectedCountry = useMemo(
    function getSelectedCountry() {
      return filteredCountries.find(function findSelectedCountry(country) {
        return country.countryCode === resolvedCountryCode;
      });
    },
    [filteredCountries, resolvedCountryCode],
  );
  const provinceOptions = useMemo(
    function getProvinceOptions() {
      return sortProvinceNames(selectedCountry?.provinces ?? []);
    },
    [selectedCountry?.provinces],
  );
  const resolvedProvince = useMemo(
    function getResolvedProvince() {
      return resolveProvinceSelection(provinceOptions, selectedProvince);
    },
    [provinceOptions, selectedProvince],
  );
  const filteredCities = useMemo(
    function getFilteredCities() {
      return cityOptions;
    },
    [cityOptions],
  );
  const resolvedCityId = useMemo(
    function getResolvedCityId() {
      const hasSelectedCity = filteredCities.some(function hasCity(city) {
        return city.id === selectedCityId;
      });

      if (hasSelectedCity) {
        return selectedCityId;
      }

      return filteredCities[0]?.id ?? '';
    },
    [filteredCities, selectedCityId],
  );
  const selectedCity = useMemo(
    function getSelectedCity() {
      return filteredCities.find(function findSelectedCity(city) {
        return city.id === resolvedCityId;
      });
    },
    [filteredCities, resolvedCityId],
  );

  const handleCancel = useCallback(
    function handleCancel() {
      if (globalThis?.window?.history.length > 1) {
        router.back();
        return;
      }

      router.push(NAVIGATION.GROUPS);
    },
    [router],
  );

  const handleInputChange = useCallback(function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormValues(function updatePrevious(previous) {
      return {
        ...previous,
        [name]: value,
      };
    });
  }, []);

  const handleActiveChange = useCallback(function handleActiveChange(
    checked: boolean,
  ) {
    setFormValues(function updatePrevious(previous) {
      return {
        ...previous,
        active: checked,
      };
    });
  }, []);

  const handleContinentChange = useCallback(function handleContinentChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedContinent(event.target.value as City['continent']);
    setSelectedCountryCode('');
    setSelectedProvince('');
    setSelectedCityId('');
  }, []);

  const handleCountryChange = useCallback(function handleCountryChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedCountryCode(event.target.value);
    setSelectedProvince('');
    setSelectedCityId('');
  }, []);

  const handleProvinceChange = useCallback(function handleProvinceChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedProvince(event.target.value);
    setSelectedCityId('');
  }, []);

  const handleCityChange = useCallback(function handleCityChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedCityId(event.target.value);
  }, []);

  useEffect(
    function syncCitiesWithLocation() {
      let cancelled = false;

      async function loadCities() {
        if (!resolvedCountryCode) {
          setCityOptions([]);
          setCitiesError('');
          setIsCitiesPending(false);
          return;
        }

        if (provinceOptions.length > 0 && !resolvedProvince) {
          setCityOptions([]);
          setCitiesError('');
          setIsCitiesPending(false);
          return;
        }

        setIsCitiesPending(true);
        setCitiesError('');

        try {
          const response = await getCities({
            countryCode: resolvedCountryCode,
            province: resolvedProvince || undefined,
          });

          if (cancelled) {
            return;
          }

          setCityOptions(response.data.map(toCityOption));
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error('Failed to load cities for group creation', error);
          setCityOptions([]);
          setCitiesError('We could not load cities for the selected province.');
        } finally {
          if (!cancelled) {
            setIsCitiesPending(false);
          }
        }
      }

      void loadCities();

      return function cleanup() {
        cancelled = true;
      };
    },
    [provinceOptions.length, resolvedCountryCode, resolvedProvince],
  );

  useEffect(
    function syncActionState() {
      if (actionState.status === 'idle') {
        return;
      }

      if (actionState.status === 'error' && actionState.error) {
        const errorMessage =
          actionState.error.error ||
          actionState.error.message ||
          'We could not create the group.';
        toast.error(errorMessage);
        return;
      }

      if (actionState.status === 'success') {
        toast.success('Group created successfully.');
        handleCancel();
      }
    },
    [actionState.error, actionState.status, handleCancel],
  );

  const isSubmitDisabled =
    pending ||
    isCitiesPending ||
    sortedSports.length === 0 ||
    filteredCountries.length === 0 ||
    filteredCities.length === 0 ||
    !selectedCity;

  return (
    <Form action={formAction}>
      <input type='hidden' name='cityId' value={selectedCity?.id ?? ''} />
      <input type='hidden' name='cityName' value={selectedCity?.name ?? ''} />
      <input type='hidden' name='countryCode' value={resolvedCountryCode} />
      <input
        type='hidden'
        name='countryName'
        value={selectedCity?.country ?? selectedCountry?.name ?? ''}
      />
      <input
        type='hidden'
        name='localizedCountryName'
        value={selectedCountry?.localizedName ?? selectedCountry?.name ?? ''}
      />
      <input
        type='hidden'
        name='continent'
        value={selectedCity?.continent ?? selectedContinent}
      />
      <input
        type='hidden'
        name='province'
        value={selectedCity?.province ?? resolvedProvince}
      />
      <input
        type='hidden'
        name='latitude'
        value={selectedCity?.latitude?.toString() ?? ''}
      />
      <input
        type='hidden'
        name='longitude'
        value={selectedCity?.longitude?.toString() ?? ''}
      />

      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Group name'
              name='name'
              placeholder='Enter group name'
              value={formValues.name}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <Select
              label='Sport'
              name='sportId'
              value={selectedSportId}
              onChange={handleInputChange}
              placeholder='Select sport'
              required
              disabled={pending || sortedSports.length === 0}
            >
              {sortedSports.map(function renderSportOption(sport) {
                return (
                  <option key={sport.id} value={sport.id}>
                    {sport.localizedName || sport.name}
                  </option>
                );
              })}
            </Select>
            <TextArea
              label='Description'
              name='description'
              placeholder='Describe the group'
              value={formValues.description}
              onChange={handleInputChange}
              rows={5}
              className='grid-column--2'
              disabled={pending}
            />
          </Grid>

          <Grid gap={8} columns={4}>
            <Select
              label='Privacy'
              name='privacy'
              value={formValues.privacy}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_PRIVACY_OPTIONS.map(function renderPrivacy(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Visibility'
              name='visibility'
              value={formValues.visibility}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_VISIBILITY_OPTIONS.map(function renderVisibility(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Join mode'
              name='joinMode'
              value={formValues.joinMode}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_JOIN_MODE_OPTIONS.map(function renderJoinMode(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <CheckBoxInput
              name='active'
              label='Active'
              defaultChecked={formValues.active}
              onChange={function handleChecked(event) {
                handleActiveChange(event.target.checked);
              }}
              value='true'
              disabled={pending}
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={8} columns={2}>
            <Select
              label='Continent'
              name='continentSelect'
              value={selectedContinent}
              onChange={handleContinentChange}
              required
              disabled={pending}
            >
              {CONTINENTS.map(function renderContinent(continent) {
                return (
                  <option key={continent.value} value={continent.value}>
                    {continent.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Country'
              name='countrySelect'
              value={resolvedCountryCode}
              onChange={handleCountryChange}
              placeholder='Select country'
              required
              disabled={pending || filteredCountries.length === 0}
            >
              {filteredCountries.map(function renderCountry(country) {
                return (
                  <option key={country.id} value={country.countryCode}>
                    {country.name}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Province'
              name='provinceSelect'
              value={resolvedProvince}
              onChange={handleProvinceChange}
              placeholder='Select province'
              disabled={pending || provinceOptions.length === 0}
            >
              {provinceOptions.map(function renderProvince(province) {
                return (
                  <option key={province} value={province}>
                    {province}
                  </option>
                );
              })}
            </Select>
            <Select
              label='City'
              name='citySelect'
              value={resolvedCityId}
              onChange={handleCityChange}
              placeholder='Select city'
              required
              disabled={
                pending || isCitiesPending || filteredCities.length === 0
              }
            >
              {filteredCities.map(function renderCity(city) {
                return (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                );
              })}
            </Select>
          </Grid>

          {selectedCity ? (
            <Text size='small' color='gray'>
              {`The group location will use ${selectedCity.name}, ${selectedCity.province ?? selectedCity.country}.`}
            </Text>
          ) : null}

          {selectedCity ? null : (
            <Text size='small' color='gray'>
              {citiesError ||
                (isCitiesPending
                  ? 'Loading cities for the selected province.'
                  : 'Select a province with available cities to finish the location.')}
            </Text>
          )}

          <ButtonGroup gap={4} className='margin-top--24'>
            <Button
              type='submit'
              disabled={isSubmitDisabled}
              aria-busy={pending}
            >
              {pending ? 'Creating group...' : 'Create group'}
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
      </Grid>
    </Form>
  );
}
