/** @format */

'use client';

// File: src/app/users/_components/forms/ProfileDetail.tsx
// Purpose: Edit user profile data using the current nested user payload shape
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { updateUserProfile } from '@/_actions/user/updateUserProfile';
import { getCities } from '@/_actions/city/getCities';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Line from '@/_components/Line';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import CONTINENTS, { type ContinentCode } from '@/_constants/continents';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import { GENDERS } from '@/_types/genders';
import type { User } from '@/_types/user';
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ProfileDetailFormState = Readonly<{
  tag: string;
  avatar: string;
  name: string;
  middlename: string;
  surname: string;
  description: string;
  height: string;
  weight: string;
  birthdate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  continent: ContinentCode | '';
  country: string;
  localizedName: string;
  province: string;
  city: string;
  street: string;
  number: string;
  zip: string;
  latitude: string;
  longitude: string;
}>;

type UserCountryOption = Readonly<
  Pick<Country, 'id' | 'name' | 'continentCode' | 'iso2Code'>
>;

type UserCityOption = Readonly<{
  id: string;
  name: string;
  countryId: string;
  provinceName: string | null;
  regionName: string | null;
  latitude: number | null;
  longitude: number | null;
}>;

function renderGenderOptions(): React.ReactNode[] {
  return GENDERS.map(gender => (
    <option key={gender} value={gender}>
      {gender}
    </option>
  ));
}

function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function normalizeBirthdateForApi(value: string): Readonly<{
  isValid: boolean;
  value: string | null;
}> {
  const normalizedValue = value.trim();
  if (!normalizedValue) return { isValid: true, value: null };

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);
  if (!match) return { isValid: false, value: null };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(normalizedDate.getTime()) ||
    normalizedDate.getUTCFullYear() !== year ||
    normalizedDate.getUTCMonth() !== month - 1 ||
    normalizedDate.getUTCDate() !== day
  ) {
    return { isValid: false, value: null };
  }

  return { isValid: true, value: normalizedDate.toISOString() };
}

function createInitialFormState(user: User): ProfileDetailFormState {
  return {
    tag: user.identity?.tag ?? '',
    avatar: user.profile?.avatar ?? '',
    name: user.profile?.name ?? '',
    middlename: user.profile?.middlename ?? '',
    surname: user.profile?.surname ?? '',
    description: user.profile?.description ?? '',
    height: user.profile?.characteristics?.height?.toString() ?? '',
    weight: user.profile?.characteristics?.weight?.toString() ?? '',
    birthdate: formatDateForInput(user.profile?.characteristics?.birthdate),
    gender: user.profile?.characteristics?.gender ?? 'OTHER',
    continent: (user.profile?.location?.continent as ContinentCode) ?? '',
    country: user.profile?.location?.country ?? '',
    localizedName: user.profile?.location?.localizedName ?? '',
    province: user.profile?.location?.province ?? '',
    city: user.profile?.location?.city ?? '',
    street: user.profile?.location?.street ?? '',
    number: user.profile?.location?.number?.toString() ?? '',
    zip: user.profile?.location?.zip ?? '',
    latitude: user.profile?.location?.coords?.lat?.toString() ?? '',
    longitude: user.profile?.location?.coords?.lng?.toString() ?? '',
  } satisfies ProfileDetailFormState;
}

function normalizeText(value: string | undefined | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function sortCountries(
  countries: ReadonlyArray<UserCountryOption>,
): ReadonlyArray<UserCountryOption> {
  return [...countries].sort(function compareCountries(a, b) {
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  });
}

function toCityOption(city: City): UserCityOption {
  return {
    id: city.id,
    name: city.name,
    countryId: city.countryId,
    provinceName: city.provinceName,
    regionName: city.regionName,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

function findMatchingCountry(
  countries: ReadonlyArray<UserCountryOption>,
  countryName: string,
): UserCountryOption | undefined {
  const normalized = normalizeText(countryName);
  return countries.find(function matchCountry(country) {
    return (
      normalizeText(country.name) === normalized ||
      normalizeText(country.iso2Code) === normalized
    );
  });
}

function findMatchingCity(
  cities: ReadonlyArray<UserCityOption>,
  cityName: string,
): UserCityOption | undefined {
  const normalized = normalizeText(cityName);
  return cities.find(function matchCity(city) {
    return normalizeText(city.name) === normalized;
  });
}

function uniqueProvinceNames(
  cities: ReadonlyArray<UserCityOption>,
): ReadonlyArray<string> {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const city of cities) {
    if (city.provinceName && !seen.has(city.provinceName)) {
      seen.add(city.provinceName);
      result.push(city.provinceName);
    }
  }
  return result.sort(function compareProvinces(a, b) {
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
  });
}

function updateLocationFormData(
  currentState: ProfileDetailFormState,
  nextFields: Readonly<Partial<ProfileDetailFormState>>,
): ProfileDetailFormState {
  return { ...currentState, ...nextFields } satisfies ProfileDetailFormState;
}

function parseNumberOrZero(value: string): number {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return 0;
  return parsedValue;
}

function buildCoords(
  latitude: string,
  longitude: string,
): Readonly<{ lat: number; lng: number }> | null {
  const normalizedLatitude = latitude.trim();
  const normalizedLongitude = longitude.trim();
  if (!normalizedLatitude || !normalizedLongitude) return null;

  const lat = Number(normalizedLatitude);
  const lng = Number(normalizedLongitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export default function ProfileDetailForm({ user }: Readonly<{ user: User }>) {
  const [formData, setFormData] = useState<ProfileDetailFormState>(
    createInitialFormState(user),
  );
  const [countries, setCountries] = useState<ReadonlyArray<UserCountryOption>>(
    [],
  );
  // All cities for selected country — province filter applied client-side
  const [allCitiesForCountry, setAllCitiesForCountry] = useState<
    ReadonlyArray<UserCityOption>
  >([]);
  const [selectedContinent, setSelectedContinent] = useState<
    ContinentCode | ''
  >((user.profile?.location?.continent as ContinentCode) ?? '');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(
    user.profile?.location?.province ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountriesPending, setIsCountriesPending] = useState(false);
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [countriesError, setCountriesError] = useState('');
  const [citiesError, setCitiesError] = useState('');

  const sortedCountries = sortCountries(countries);
  const filteredCountries = sortedCountries.filter(function filterCountry(
    country,
  ) {
    return selectedContinent ? country.continentCode === selectedContinent : true;
  });
  const selectedCountry = filteredCountries.find(function findCountry(country) {
    return country.id === selectedCountryId;
  });

  const provinceOptions = uniqueProvinceNames(allCitiesForCountry);
  const cityOptions = selectedProvince
    ? allCitiesForCountry.filter(function filterByProvince(city) {
        return city.provinceName === selectedProvince;
      })
    : allCitiesForCountry;

  useEffect(function loadCountriesOnMount() {
    let cancelled = false;

    async function loadCountries(): Promise<void> {
      setIsCountriesPending(true);
      setCountriesError('');

      try {
        const catalog = await getAllCountries();
        if (cancelled) return;
        setCountries(catalog);
      } catch (error: unknown) {
        if (cancelled) return;
        console.error('Failed to load countries for user profile form', error);
        setCountries([]);
        setCountriesError('We could not load countries for the location form.');
      } finally {
        if (!cancelled) setIsCountriesPending(false);
      }
    }

    void loadCountries();
    return function cleanup() {
      cancelled = true;
    };
  }, []);

  useEffect(
    function syncInitialCountrySelection() {
      if (countries.length === 0 || selectedCountryId) return;

      const matchedCountry = findMatchingCountry(countries, formData.country);
      if (!matchedCountry) return;

      setSelectedContinent(
        (matchedCountry.continentCode as ContinentCode) ?? '',
      );
      setSelectedCountryId(matchedCountry.id);
      setFormData(function updatePreviousState(previousState) {
        return updateLocationFormData(previousState, {
          continent: (matchedCountry.continentCode as ContinentCode) ?? '',
          country: matchedCountry.name,
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countries, formData.country, selectedCountryId],
  );

  useEffect(
    function loadCitiesForSelectedCountry() {
      let cancelled = false;

      async function loadCities(): Promise<void> {
        if (!selectedCountryId) {
          setAllCitiesForCountry([]);
          setCitiesError('');
          setIsCitiesPending(false);
          return;
        }

        setIsCitiesPending(true);
        setCitiesError('');

        try {
          const response = await getCities({ countryId: selectedCountryId });
          if (cancelled) return;
          setAllCitiesForCountry(response.data.map(toCityOption));
        } catch (error: unknown) {
          if (cancelled) return;
          console.error('Failed to load cities for user profile form', error);
          setAllCitiesForCountry([]);
          setCitiesError('We could not load cities for the selected country.');
        } finally {
          if (!cancelled) setIsCitiesPending(false);
        }
      }

      void loadCities();
      return function cleanup() {
        cancelled = true;
      };
    },
    [selectedCountryId],
  );

  useEffect(
    function syncInitialCitySelection() {
      if (cityOptions.length === 0) return;

      const matchedCity = findMatchingCity(cityOptions, formData.city);
      const nextCity = matchedCity ?? cityOptions[0];

      if (!nextCity) return;

      setFormData(function updatePreviousState(previousState) {
        const nextLatitude = nextCity.latitude?.toString() ?? '';
        const nextLongitude = nextCity.longitude?.toString() ?? '';

        if (
          previousState.city === nextCity.name &&
          previousState.latitude === nextLatitude &&
          previousState.longitude === nextLongitude
        ) {
          return previousState;
        }

        return updateLocationFormData(previousState, {
          province: nextCity.provinceName ?? previousState.province,
          city: nextCity.name,
          latitude: nextLatitude,
          longitude: nextLongitude,
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityOptions, formData.city],
  );

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void {
    const fieldName = e.target.name as keyof ProfileDetailFormState;
    const value = e.target.value;
    setFormData(function updatePreviousState(previousState) {
      return { ...previousState, [fieldName]: value } satisfies ProfileDetailFormState;
    });
  }

  function handleContinentChange(e: ChangeEvent<HTMLSelectElement>): void {
    const nextContinent = e.target.value as ContinentCode | '';
    setSelectedContinent(nextContinent);
    setSelectedCountryId('');
    setSelectedProvince('');
    setAllCitiesForCountry([]);
    setFormData(function updatePreviousState(previousState) {
      return updateLocationFormData(previousState, {
        continent: nextContinent,
        country: '',
        province: '',
        city: '',
        localizedName: '',
        latitude: '',
        longitude: '',
      });
    });
  }

  function handleCountryChange(e: ChangeEvent<HTMLSelectElement>): void {
    const nextCountryId = e.target.value;
    const nextCountry = filteredCountries.find(function findCountry(country) {
      return country.id === nextCountryId;
    });
    setSelectedCountryId(nextCountryId);
    setSelectedProvince('');
    setAllCitiesForCountry([]);
    setFormData(function updatePreviousState(previousState) {
      return updateLocationFormData(previousState, {
        continent:
          (nextCountry?.continentCode as ContinentCode) ??
          previousState.continent,
        country: nextCountry?.name ?? '',
        province: '',
        city: '',
        localizedName: '',
        latitude: '',
        longitude: '',
      });
    });
  }

  function handleProvinceChange(e: ChangeEvent<HTMLSelectElement>): void {
    const nextProvince = e.target.value;
    setSelectedProvince(nextProvince);
    setFormData(function updatePreviousState(previousState) {
      return updateLocationFormData(previousState, {
        province: nextProvince,
        city: '',
        latitude: '',
        longitude: '',
      });
    });
  }

  function handleCityChange(e: ChangeEvent<HTMLSelectElement>): void {
    const nextCityId = e.target.value;
    const nextCity = cityOptions.find(function findCity(city) {
      return city.id === nextCityId;
    });
    if (!nextCity) return;

    setFormData(function updatePreviousState(previousState) {
      return updateLocationFormData(previousState, {
        province: nextCity.provinceName ?? previousState.province,
        city: nextCity.name,
        latitude: nextCity.latitude?.toString() ?? '',
        longitude: nextCity.longitude?.toString() ?? '',
      });
    });
  }

  async function handleSubmit(e: {
    preventDefault: () => void;
  }): Promise<void> {
    e.preventDefault();
    setIsSubmitting(true);

    const normalizedBirthdate = normalizeBirthdateForApi(formData.birthdate);

    if (!normalizedBirthdate.isValid) {
      toast.error('Invalid birthdate.', {
        description: 'Use a real date in YYYY-MM-DD format.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateUserProfile({
        uuid: user.uuid,
        username: user.identity?.username,
        identity: {
          tag: formData.tag.trim(),
        },
        profile: {
          name: formData.name.trim(),
          middlename: formData.middlename.trim(),
          surname: formData.surname.trim(),
          avatar: formData.avatar.trim(),
          description: formData.description.trim(),
          characteristics: {
            birthdate: normalizedBirthdate.value,
            weight: parseNumberOrZero(formData.weight),
            height: parseNumberOrZero(formData.height),
            gender: formData.gender,
          },
          location: {
            continent: formData.continent,
            country: formData.country.trim(),
            localizedName: formData.localizedName.trim(),
            province: formData.province.trim(),
            city: formData.city.trim(),
            street: formData.street.trim(),
            number: parseNumberOrZero(formData.number),
            zip: formData.zip.trim(),
            coords: buildCoords(formData.latitude, formData.longitude),
          },
        },
      });

      if (result.status === 'error') {
        toast.error(result.error?.message ?? 'Failed to update profile.', {
          description: result.error?.reason,
        });
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message, {
        description: 'Unexpected error while updating profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Grid columns={2} gap={32} alignItems='start'>
        <Section gap={32}>
          <Grid gap={16}>
            <Title size='tiny' weight='bold'>
              Personal Information
            </Title>
            <Grid gap={16}>
              <TextArea
                label='Description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={10}
              />
              <Grid gap={8} columns={3}>
                <TextInput
                  label='Name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Name (optional)'
                />
                <TextInput
                  label='Middlename'
                  name='middlename'
                  value={formData.middlename}
                  onChange={handleInputChange}
                  placeholder='Middlename (optional)'
                />
                <TextInput
                  label='Surname'
                  name='surname'
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder='Surname (optional)'
                />
              </Grid>
              <Grid gap={8} columns={2}>
                <TextInput
                  label='Tag'
                  name='tag'
                  value={formData.tag}
                  onChange={handleInputChange}
                  placeholder='The Dark Rider'
                />
                <TextInput
                  label='Avatar URL'
                  name='avatar'
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder='https://...'
                />
              </Grid>
            </Grid>
          </Grid>
          <Line />
          <Grid gap={8}>
            <Title size='tiny' weight='bold'>
              Vitals
            </Title>
            <Grid columns={3} gap={8}>
              <TextInput
                label='Height (cms)'
                name='height'
                type='number'
                value={formData.height}
                onChange={handleInputChange}
              />
              <TextInput
                label='Weight (kgs)'
                name='weight'
                type='number'
                value={formData.weight}
                onChange={handleInputChange}
              />
              <TextInput
                label='Birthdate'
                name='birthdate'
                type='date'
                value={formData.birthdate}
                onChange={handleInputChange}
              />
              <Select
                label='Gender'
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
              >
                {renderGenderOptions()}
              </Select>
            </Grid>
          </Grid>
        </Section>
        <Section gap={32}>
          <Grid gap={16}>
            <Title size='tiny' weight='bold'>
              Location
            </Title>
            <Grid columns={2} gap={16}>
              <Select
                label='Continent'
                name='continent'
                value={selectedContinent}
                onChange={handleContinentChange}
                disabled={isCountriesPending}
              >
                <option value=''>Select continent</option>
                {CONTINENTS.map(continent => (
                  <option key={continent.value} value={continent.value}>
                    {continent.label}
                  </option>
                ))}
              </Select>
              <TextInput
                label='Localized Name'
                name='localizedName'
                value={formData.localizedName}
                onChange={handleInputChange}
                placeholder='Local or display location name'
              />
            </Grid>
            {countriesError ? (
              <Text size='small' color='gray'>
                {countriesError}
              </Text>
            ) : null}
            <Grid columns={2} gap={16}>
              <Select
                label='Country'
                name='country'
                value={selectedCountryId}
                onChange={handleCountryChange}
                disabled={isCountriesPending || filteredCountries.length === 0}
              >
                <option value=''>Select country</option>
                {filteredCountries.map(function renderCountry(country) {
                  return (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  );
                })}
              </Select>
              <Select
                label='Province'
                name='province'
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={
                  isCountriesPending ||
                  isCitiesPending ||
                  provinceOptions.length === 0
                }
              >
                <option value=''>Select province</option>
                {provinceOptions.map(function renderProvince(province) {
                  return (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  );
                })}
              </Select>
            </Grid>
            <Grid gap={8}>
              <Select
                label='City'
                name='city'
                value={
                  cityOptions.find(function matchCity(city) {
                    return (
                      normalizeText(city.name) === normalizeText(formData.city)
                    );
                  })?.id ?? ''
                }
                onChange={handleCityChange}
                disabled={isCitiesPending || cityOptions.length === 0}
              >
                <option value=''>Select city</option>
                {cityOptions.map(function renderCity(city) {
                  return (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  );
                })}
              </Select>
              {citiesError ? (
                <Text size='small' color='gray'>
                  {citiesError}
                </Text>
              ) : null}
              <Grid columns={2} gap={16}>
                <TextInput
                  label='Latitude'
                  name='latitude'
                  value={formData.latitude}
                  onChange={handleInputChange}
                  type='number'
                  step='any'
                  disabled={cityOptions.length > 0}
                />
                <TextInput
                  label='Longitude'
                  name='longitude'
                  value={formData.longitude}
                  onChange={handleInputChange}
                  type='number'
                  step='any'
                  disabled={cityOptions.length > 0}
                />
              </Grid>
            </Grid>
            <Grid gap={16}>
              <Title size='tiny' weight='bold'>
                Address
              </Title>
            </Grid>
            <Grid columns={3} gap={8}>
              <TextInput
                label='Street'
                name='street'
                value={formData.street}
                onChange={handleInputChange}
                type='text'
              />
              <TextInput
                label='Number'
                name='number'
                value={formData.number}
                onChange={handleInputChange}
                type='number'
              />
              <TextInput
                label='Zip Code'
                name='zip'
                value={formData.zip}
                onChange={handleInputChange}
              />
            </Grid>
            <ButtonGroup>
              <Button type='submit' icon='userEdit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update'}
              </Button>
            </ButtonGroup>
          </Grid>
        </Section>
      </Grid>
    </Form>
  );
}
