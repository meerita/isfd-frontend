/** @format */

'use client';

// File: src/app/events/_components/EventForm.tsx
// Purpose: Form component to create or edit events with dependent location selectors
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getCities } from '@/_actions/city/getCities';
import { createEvent } from '@/_actions/event/createEvent';
import { updateEvent } from '@/_actions/event/updateEvent';
import { getPlaces } from '@/_actions/place/getPlaces';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import LastUpdated from '@/_components/forms/LastUpdated';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import CONTINENTS from '@/_constants/continents';
import {
  GROUP_EVENT_ACTIVITY_OPTIONS,
  GROUP_EVENT_GENDER_OPTIONS,
  GROUP_EVENT_REPLACEMENTS_OPTIONS,
  GROUP_EVENT_SKILL_OPTIONS,
} from '@/_constants/groupPreferences';
import NAVIGATION from '@/_constants/navigation';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type { Event, EventActionState, EventStatus } from '@/_types/event';
import type { Group } from '@/_types/group';
import type { Place } from '@/_types/place';
import type { Sport } from '@/_types/sport';

const INITIAL_ACTION_STATE: EventActionState = { status: 'idle' };

const EVENT_STATUS_OPTIONS: ReadonlyArray<
  Readonly<{ value: EventStatus; label: string }>
> = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FINISHED', label: 'Finished' },
];

type EventFormValues = Readonly<{
  title: string;
  description: string;
  imageUrl: string;
  sportId: string;
  groupId: string;
  startTimeLocal: string;
  endTimeLocal: string;
  timezone: string;
  capacityMin: string;
  capacityMax: string;
  preferenceGender: string;
  preferenceSkill: string;
  preferenceReplacements: string;
  preferenceActivity: string;
  status: EventStatus;
  preferenceVisibility: boolean;
  preferenceInvitations: boolean;
}>;

type EventCountryOption = Readonly<
  Pick<
    Country,
    'id' | 'name' | 'localizedName' | 'countryCode' | 'continent' | 'provinces'
  >
>;

type EventCityOption = Readonly<{
  id: string;
  name: string;
  country: string;
  countryCode: string;
  continent: City['continent'];
  province?: string;
}>;

type EventPlaceOption = Readonly<{
  id: string;
  name: string;
  status?: string;
}>;

type EventGroupOption = Readonly<Pick<Group, 'id' | 'name'>>;

type EventFormProps = Readonly<{
  countries: ReadonlyArray<EventCountryOption>;
  sports: ReadonlyArray<Sport>;
  groups: ReadonlyArray<EventGroupOption>;
  event?: Event | null;
  initialCity?: City | null;
  initialPlace?: Place | null;
  edit?: boolean;
}>;

function toStringValue(value?: number): string {
  return typeof value === 'number' ? value.toString() : '';
}

function formatDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string {
  if (!value.trim()) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

function buildInitialValues(event?: Event | null): EventFormValues {
  return {
    title: event?.title ?? '',
    description: event?.description ?? '',
    imageUrl: event?.imageUrl ?? '',
    sportId: event?.sportId ?? '',
    groupId: event?.groupId ?? '',
    startTimeLocal: formatDateTimeLocalValue(event?.startTime),
    endTimeLocal: formatDateTimeLocalValue(event?.endTime),
    timezone: event?.timezone ?? 'Europe/Madrid',
    capacityMin: toStringValue(event?.capacity?.min),
    capacityMax: toStringValue(event?.capacity?.max),
    preferenceGender: event?.preferences?.gender ?? 'OTHER',
    preferenceSkill: event?.preferences?.skill ?? 'ANY',
    preferenceReplacements: event?.preferences?.replacements ?? 'ALLOWED',
    preferenceActivity: event?.preferences?.activity ?? 'TYPE_ONE',
    status: event?.status ?? 'SCHEDULED',
    preferenceVisibility: event?.preferences?.visibility ?? true,
    preferenceInvitations: event?.preferences?.invitations ?? true,
  } satisfies EventFormValues;
}

function toCityOption(city: City): EventCityOption {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    continent: city.continent,
    province: city.province,
  };
}

function toPlaceOption(place: Place): EventPlaceOption {
  return {
    id: place.id,
    name: place.name,
    status: place.status,
  };
}

function sortCountries(
  countries: ReadonlyArray<EventCountryOption>,
): ReadonlyArray<EventCountryOption> {
  return [...countries].sort(function compareCountries(countryA, countryB) {
    return countryA.name.localeCompare(countryB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

function sortSports(sports: ReadonlyArray<Sport>): ReadonlyArray<Sport> {
  return [...sports].sort(function compareSports(sportA, sportB) {
    return (sportA.localizedName || sportA.name).localeCompare(
      sportB.localizedName || sportB.name,
      'en',
      {
        sensitivity: 'base',
      },
    );
  });
}

function sortGroups(
  groups: ReadonlyArray<EventGroupOption>,
): ReadonlyArray<EventGroupOption> {
  return [...groups].sort(function compareGroups(groupA, groupB) {
    return groupA.name.localeCompare(groupB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

function sortProvinceNames(
  values: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return [...values]
    .map(function normalize(value) {
      return value.trim();
    })
    .filter(Boolean)
    .sort(function compareProvinceNames(valueA, valueB) {
      return valueA.localeCompare(valueB, 'en', { sensitivity: 'base' });
    });
}

function sortPlaces(
  places: ReadonlyArray<EventPlaceOption>,
): ReadonlyArray<EventPlaceOption> {
  return [...places].sort(function comparePlaces(placeA, placeB) {
    return placeA.name.localeCompare(placeB.name, 'en', {
      sensitivity: 'base',
    });
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

export default function EventForm({
  countries,
  sports,
  groups,
  event,
  initialCity,
  initialPlace,
  edit = false,
}: EventFormProps) {
  const router = useRouter();
  const initialValues = buildInitialValues(event);
  const [formValues, setFormValues] = useState(initialValues);
  const [selectedContinent, setSelectedContinent] = useState<City['continent']>(
    initialCity?.continent ?? (CONTINENTS[0]?.value as City['continent']),
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    initialCity?.countryCode ?? '',
  );
  const [selectedProvince, setSelectedProvince] = useState(
    initialCity?.province ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(initialCity?.id ?? '');
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    initialPlace?.id ?? event?.placeId ?? '',
  );
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<EventCityOption>>(
    initialCity ? [toCityOption(initialCity)] : [],
  );
  const [placeOptions, setPlaceOptions] = useState<
    ReadonlyArray<EventPlaceOption>
  >(initialPlace ? [toPlaceOption(initialPlace)] : []);
  const [citiesError, setCitiesError] = useState('');
  const [placesError, setPlacesError] = useState('');
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [isPlacesPending, setIsPlacesPending] = useState(false);
  const actionHandler = edit ? updateEvent : createEvent;
  const [actionState, formAction, pending] = useActionState<
    EventActionState,
    FormData
  >(actionHandler, INITIAL_ACTION_STATE);

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
  const sortedGroups = useMemo(
    function getSortedGroups() {
      return sortGroups(groups);
    },
    [groups],
  );
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
      const hasSelectedCountry = filteredCountries.some(function hasCountry(
        country,
      ) {
        return country.countryCode === selectedCountryCode;
      });

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
  const resolvedSportId = formValues.sportId || sortedSports[0]?.id || '';
  const resolvedGroupId = formValues.groupId || sortedGroups[0]?.id || '';
  const resolvedCityId = useMemo(
    function getResolvedCityId() {
      const hasSelectedCity = cityOptions.some(function hasCity(city) {
        return city.id === selectedCityId;
      });

      if (hasSelectedCity) {
        return selectedCityId;
      }

      return cityOptions[0]?.id ?? '';
    },
    [cityOptions, selectedCityId],
  );
  const resolvedPlaceId = useMemo(
    function getResolvedPlaceId() {
      const hasSelectedPlace = placeOptions.some(function hasPlace(place) {
        return place.id === selectedPlaceId;
      });

      if (hasSelectedPlace) {
        return selectedPlaceId;
      }

      return placeOptions[0]?.id ?? '';
    },
    [placeOptions, selectedPlaceId],
  );
  const sortedPlaceOptions = useMemo(
    function getSortedPlaceOptions() {
      return sortPlaces(placeOptions);
    },
    [placeOptions],
  );
  const startTimeIso = useMemo(
    function getStartTimeIso() {
      return toIsoDateTime(formValues.startTimeLocal);
    },
    [formValues.startTimeLocal],
  );
  const endTimeIso = useMemo(
    function getEndTimeIso() {
      return toIsoDateTime(formValues.endTimeLocal);
    },
    [formValues.endTimeLocal],
  );
  const lastUpdatedTimestamp = event?.updatedAt ?? event?.createdAt ?? null;

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

          console.error('Failed to load cities for event form', error);
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
    function syncPlacesWithCity() {
      let cancelled = false;

      async function loadPlaces() {
        if (!resolvedCityId) {
          setPlaceOptions([]);
          setPlacesError('');
          setIsPlacesPending(false);
          return;
        }

        setIsPlacesPending(true);
        setPlacesError('');

        try {
          const places = await getPlaces({ cityId: resolvedCityId });

          if (cancelled) {
            return;
          }

          setPlaceOptions(places.map(toPlaceOption));
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error('Failed to load places for event form', error);
          setPlaceOptions([]);
          setPlacesError('We could not load places for the selected city.');
        } finally {
          if (!cancelled) {
            setIsPlacesPending(false);
          }
        }
      }

      void loadPlaces();

      return function cleanup() {
        cancelled = true;
      };
    },
    [resolvedCityId],
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
          'We could not save the event.';
        toast.error(errorMessage);
        return;
      }

      if (actionState.status === 'success') {
        if (edit) {
          toast.success('Event updated successfully.');
          return;
        }

        toast.success('Event created successfully.');

        if (actionState.eventId) {
          router.push(NAVIGATION.EVENT_BY_ID(actionState.eventId));
          return;
        }

        router.push(NAVIGATION.EVENTS);
      }
    },
    [actionState.error, actionState.eventId, actionState.status, edit, router],
  );

  function handleInputChange(
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormValues(function updatePrevious(previous) {
      return {
        ...previous,
        [name]: value,
      };
    });
  }

  function handlePreferenceToggleChange(
    field: 'preferenceVisibility' | 'preferenceInvitations',
    checked: boolean,
  ) {
    setFormValues(function updatePrevious(previous) {
      return {
        ...previous,
        [field]: checked,
      };
    });
  }

  function handleContinentChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedContinent(event.target.value as City['continent']);
    setSelectedCountryCode('');
    setSelectedProvince('');
    setSelectedCityId('');
    setSelectedPlaceId('');
    setCityOptions([]);
    setPlaceOptions([]);
  }

  function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCountryCode(event.target.value);
    setSelectedProvince('');
    setSelectedCityId('');
    setSelectedPlaceId('');
    setCityOptions([]);
    setPlaceOptions([]);
  }

  function handleProvinceChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedProvince(event.target.value);
    setSelectedCityId('');
    setSelectedPlaceId('');
    setPlaceOptions([]);
  }

  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCityId(event.target.value);
    setSelectedPlaceId('');
    setPlaceOptions([]);
  }

  function handlePlaceChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedPlaceId(event.target.value);
  }

  function handleCancel() {
    if (globalThis?.window?.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.EVENTS);
  }

  const isSubmitDisabled =
    pending ||
    isCitiesPending ||
    isPlacesPending ||
    sortedSports.length === 0 ||
    sortedGroups.length === 0 ||
    filteredCountries.length === 0 ||
    cityOptions.length === 0 ||
    sortedPlaceOptions.length === 0 ||
    !startTimeIso ||
    !endTimeIso;

  return (
    <Form action={formAction}>
      {edit && event ? <input type='hidden' name='eventId' value={event.id} /> : null}
      <input type='hidden' name='startTime' value={startTimeIso} />
      <input type='hidden' name='endTime' value={endTimeIso} />

      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Title'
              name='title'
              placeholder='Enter event title'
              value={formValues.title}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <Select
              label='Status'
              name='status'
              value={formValues.status}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {EVENT_STATUS_OPTIONS.map(function renderStatusOption(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Sport'
              name='sportId'
              value={resolvedSportId}
              onChange={handleInputChange}
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
            <Select
              label='Group'
              name='groupId'
              value={resolvedGroupId}
              onChange={handleInputChange}
              required
              disabled={pending || sortedGroups.length === 0}
            >
              {sortedGroups.map(function renderGroupOption(group) {
                return (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                );
              })}
            </Select>
            <TextInput
              label='Image URL'
              name='imageUrl'
              type='url'
              placeholder='https://example.com/event.jpg'
              value={formValues.imageUrl}
              onChange={handleInputChange}
              className='grid-column--2'
              disabled={pending}
            />
            <TextArea
              label='Description'
              name='description'
              placeholder='Describe the event'
              value={formValues.description}
              onChange={handleInputChange}
              rows={6}
              className='grid-column--2'
              disabled={pending}
            />
          </Grid>

          <Grid gap={8} columns={2} className='margin-top--24'>
            <TextInput
              label='Start time'
              name='startTimeLocal'
              type='datetime-local'
              value={formValues.startTimeLocal}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <TextInput
              label='End time'
              name='endTimeLocal'
              type='datetime-local'
              value={formValues.endTimeLocal}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <TextInput
              label='Timezone'
              name='timezone'
              placeholder='Europe/Madrid'
              value={formValues.timezone}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <TextInput
              label='Minimum capacity'
              name='capacityMin'
              type='number'
              min='0'
              value={formValues.capacityMin}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <TextInput
              label='Maximum capacity'
              name='capacityMax'
              type='number'
              min='0'
              value={formValues.capacityMax}
              onChange={handleInputChange}
              required
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
              required
              disabled={pending || filteredCountries.length === 0}
            >
              {filteredCountries.map(function renderCountryOption(country) {
                return (
                  <option key={country.id} value={country.countryCode}>
                    {country.localizedName || country.name}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Province'
              name='provinceSelect'
              value={resolvedProvince}
              onChange={handleProvinceChange}
              disabled={pending || provinceOptions.length === 0}
            >
              {provinceOptions.length === 0 ? (
                <option value=''>No provinces</option>
              ) : (
                provinceOptions.map(function renderProvinceOption(province) {
                  return (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  );
                })
              )}
            </Select>
            <Select
              label='City'
              name='citySelect'
              value={resolvedCityId}
              onChange={handleCityChange}
              required
              disabled={pending || isCitiesPending || cityOptions.length === 0}
            >
              {cityOptions.length === 0 ? (
                <option value=''>
                  {isCitiesPending ? 'Loading cities…' : 'No cities available'}
                </option>
              ) : (
                cityOptions.map(function renderCityOption(city) {
                  return (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  );
                })
              )}
            </Select>
            <Select
              label='Place'
              name='placeId'
              value={resolvedPlaceId}
              onChange={handlePlaceChange}
              required
              disabled={pending || isPlacesPending || sortedPlaceOptions.length === 0}
              className='grid-column--2'
            >
              {sortedPlaceOptions.length === 0 ? (
                <option value=''>
                  {isPlacesPending ? 'Loading places…' : 'No places available'}
                </option>
              ) : (
                sortedPlaceOptions.map(function renderPlaceOption(place) {
                  return (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  );
                })
              )}
            </Select>
          </Grid>

          {citiesError ? (
            <Text size='small' color='red' className='margin-top--8'>
              {citiesError}
            </Text>
          ) : null}
          {placesError ? (
            <Text size='small' color='red' className='margin-top--8'>
              {placesError}
            </Text>
          ) : null}

          <Grid gap={8} columns={2} className='margin-top--24'>
            <Select
              label='Gender'
              name='preferenceGender'
              value={formValues.preferenceGender}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_EVENT_GENDER_OPTIONS.map(function renderOption(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Skill'
              name='preferenceSkill'
              value={formValues.preferenceSkill}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_EVENT_SKILL_OPTIONS.map(function renderOption(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Replacements'
              name='preferenceReplacements'
              value={formValues.preferenceReplacements}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_EVENT_REPLACEMENTS_OPTIONS.map(function renderOption(
                option,
              ) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <Select
              label='Activity'
              name='preferenceActivity'
              value={formValues.preferenceActivity}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              {GROUP_EVENT_ACTIVITY_OPTIONS.map(function renderOption(option) {
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
            <CheckBoxInput
              name='preferenceVisibility'
              label='Visible'
              defaultChecked={formValues.preferenceVisibility}
              onChange={function handleChecked(event) {
                handlePreferenceToggleChange(
                  'preferenceVisibility',
                  event.target.checked,
                );
              }}
              value='true'
              disabled={pending}
            />
            <CheckBoxInput
              name='preferenceInvitations'
              label='Invitations allowed'
              defaultChecked={formValues.preferenceInvitations}
              onChange={function handleChecked(event) {
                handlePreferenceToggleChange(
                  'preferenceInvitations',
                  event.target.checked,
                );
              }}
              value='true'
              disabled={pending}
            />
          </Grid>
        </Section>
      </Grid>

      <ButtonGroup className='margin-top--24'>
        <Button type='submit' disabled={isSubmitDisabled}>
          {pending ? 'Saving…' : edit ? 'Update Event' : 'Create Event'}
        </Button>
        <Button type='button' kind='secondary' onClick={handleCancel}>
          Cancel
        </Button>
      </ButtonGroup>

      {lastUpdatedTimestamp ? (
        <LastUpdated
          date={new Date(lastUpdatedTimestamp)}
          className='margin-top--16'
        />
      ) : null}
    </Form>
  );
}
