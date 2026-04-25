/** @format */

'use client';

// File: src/app/places/_components/PlaceForm.tsx
// Purpose: Form component to create or edit places with dependent location selectors
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getCities } from '@/_actions/city/getCities';
import { createPlace } from '@/_actions/place/createPlace';
import { updatePlace } from '@/_actions/place/updatePlace';
import Button from '@/_components/forms/Button';
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
import NAVIGATION from '@/_constants/navigation';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type {
  Place,
  PlaceActionState,
  PlaceOpeningHour,
  PlaceOpeningHourDay,
  PlaceOpeningHourRange,
} from '@/_types/place';
import type { Sport } from '@/_types/sport';

const INITIAL_ACTION_STATE: PlaceActionState = { status: 'idle' };

type PlaceFormValues = Readonly<{
  name: string;
  description: string;
  ownerID: string;
  visibility: string;
  latitude: string;
  longitude: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  formattedAddress: string;
  avatarURL: string;
  images: string;
  website: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  googlePlaceID: string;
  applePlaceID: string;
  amenities: string;
}>;

type PlaceCountryOption = Readonly<
  Pick<
    Country,
    'id' | 'name' | 'localizedName' | 'countryCode' | 'continent' | 'provinces'
  >
>;

type PlaceCityOption = Readonly<{
  id: string;
  name: string;
  country: string;
  countryCode: string;
  continent: City['continent'];
  province?: string;
  latitude?: number;
  longitude?: number;
}>;

type PlaceOpeningHourState = Readonly<{
  day: PlaceOpeningHourDay;
  ranges: ReadonlyArray<PlaceOpeningHourRange>;
}>;

type WeekdayTemplateState = Readonly<{
  firstOpensAt: string;
  firstClosesAt: string;
  secondOpensAt: string;
  secondClosesAt: string;
}>;

type PlaceFormProps = Readonly<{
  countries: ReadonlyArray<PlaceCountryOption>;
  sports: ReadonlyArray<Sport>;
  place?: Place | null;
  initialCity?: City | null;
  edit?: boolean;
}>;

const toStringValue = (value?: number): string =>
  typeof value === 'number' ? value.toString() : '';

const toTextAreaValue = (values?: ReadonlyArray<string>): string =>
  values?.join('\n') ?? '';

const OPENING_HOUR_DAYS: ReadonlyArray<PlaceOpeningHourDay> = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAY_DAYS: ReadonlyArray<PlaceOpeningHourDay> = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
];

function buildInitialValues(place?: Place | null): PlaceFormValues {
  return {
    name: place?.name ?? '',
    description: place?.description ?? '',
    ownerID: place?.ownerID ?? place?.ownerId ?? '',
    visibility: place?.visibility ?? 'PUBLIC',
    latitude: toStringValue(place?.coordinates?.lat),
    longitude: toStringValue(place?.coordinates?.lng),
    street: place?.address?.street ?? '',
    streetNumber: place?.address?.streetNumber ?? '',
    postalCode: place?.address?.postalCode ?? '',
    formattedAddress: place?.address?.formatted ?? '',
    avatarURL: place?.avatarURL ?? place?.avatarUrl ?? '',
    images: toTextAreaValue(place?.images),
    website: place?.contact?.website ?? '',
    phone: place?.contact?.phone ?? '',
    email: place?.contact?.email ?? '',
    instagram: place?.contact?.instagram ?? '',
    facebook: place?.contact?.facebook ?? '',
    googlePlaceID:
      place?.externalIDs?.googlePlaceID ?? place?.externalIds?.googlePlaceID ?? '',
    applePlaceID:
      place?.externalIDs?.applePlaceID ?? place?.externalIds?.applePlaceID ?? '',
    amenities: toTextAreaValue(place?.amenities),
  };
}

function toCityOption(city: City): PlaceCityOption {
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
  countries: ReadonlyArray<PlaceCountryOption>,
): ReadonlyArray<PlaceCountryOption> {
  return [...countries].sort(function compareCountries(countryA, countryB) {
    return countryA.name.localeCompare(countryB.name, 'en', {
      sensitivity: 'base',
    });
  });
}

function sortSports(sports: ReadonlyArray<Sport>): ReadonlyArray<Sport> {
  return [...sports].sort(function compareSports(sportA, sportB) {
    return sportA.name.localeCompare(sportB.name, 'en', {
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

function getInitialContinent(initialCity?: City | null): City['continent'] {
  return initialCity?.continent ?? (CONTINENTS[0]?.value as City['continent']);
}

function getInitialCountryCode(initialCity?: City | null): string {
  return initialCity?.countryCode ?? '';
}

function getInitialProvince(initialCity?: City | null): string {
  return initialCity?.province ?? '';
}

function getInitialCityId(initialCity?: City | null): string {
  return initialCity?.id ?? '';
}

function getInitialSportId(place?: Place | null): string {
  return place?.sportIDs?.[0] ?? place?.sportIds?.[0] ?? '';
}

function createInitialOpeningHours(
  openingHours?: ReadonlyArray<PlaceOpeningHour>,
): ReadonlyArray<PlaceOpeningHourState> {
  return OPENING_HOUR_DAYS.map(function buildDay(day) {
    const matchingDay = openingHours?.find(function matchOpeningHour(entry) {
      return entry.day === day;
    });

    return {
      day,
      ranges:
        matchingDay?.ranges.map(function cloneRange(range) {
          return {
            opensAt: range.opensAt ?? '',
            closesAt: range.closesAt ?? '',
          };
        }) ?? [],
    };
  });
}

function createInitialWeekdayTemplate(
  openingHours?: ReadonlyArray<PlaceOpeningHour>,
): WeekdayTemplateState {
  const mondaySchedule = openingHours?.find(function findMonday(entry) {
    return entry.day === 'MONDAY';
  });
  const firstRange = mondaySchedule?.ranges[0];
  const secondRange = mondaySchedule?.ranges[1];

  return {
    firstOpensAt: firstRange?.opensAt ?? '',
    firstClosesAt: firstRange?.closesAt ?? '',
    secondOpensAt: secondRange?.opensAt ?? '',
    secondClosesAt: secondRange?.closesAt ?? '',
  };
}

function formatOpeningHourDayLabel(day: PlaceOpeningHourDay): string {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function serializeOpeningHours(
  openingHours: ReadonlyArray<PlaceOpeningHourState>,
): string {
  return JSON.stringify(
    openingHours
      .map(function normalizeDay(day) {
        return {
          day: day.day,
          ranges: day.ranges.filter(function filterRange(range) {
            return range.opensAt.trim() && range.closesAt.trim();
          }),
        };
      })
      .filter(function filterEmptyDays(day) {
        return day.ranges.length > 0;
      }),
  );
}

function buildRangesFromWeekdayTemplate(
  template: WeekdayTemplateState,
): ReadonlyArray<PlaceOpeningHourRange> {
  const ranges: PlaceOpeningHourRange[] = [];

  if (template.firstOpensAt.trim() && template.firstClosesAt.trim()) {
    ranges.push({
      opensAt: template.firstOpensAt.trim(),
      closesAt: template.firstClosesAt.trim(),
    });
  }

  if (template.secondOpensAt.trim() && template.secondClosesAt.trim()) {
    ranges.push({
      opensAt: template.secondOpensAt.trim(),
      closesAt: template.secondClosesAt.trim(),
    });
  }

  return ranges;
}

export default function PlaceForm({
  countries,
  sports,
  place,
  initialCity = null,
  edit = false,
}: PlaceFormProps) {
  const router = useRouter();
  const initialValues = buildInitialValues(place);
  const [formValues, setFormValues] = useState(initialValues);
  const [selectedContinent, setSelectedContinent] = useState<City['continent']>(
    getInitialContinent(initialCity),
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    getInitialCountryCode(initialCity),
  );
  const [selectedProvince, setSelectedProvince] = useState(
    getInitialProvince(initialCity),
  );
  const [selectedCityId, setSelectedCityId] = useState(
    getInitialCityId(initialCity),
  );
  const [selectedSportId, setSelectedSportId] = useState(
    getInitialSportId(place),
  );
  const [openingHours, setOpeningHours] = useState<
    ReadonlyArray<PlaceOpeningHourState>
  >(createInitialOpeningHours(place?.openingHours));
  const [weekdayTemplate, setWeekdayTemplate] = useState<WeekdayTemplateState>(
    createInitialWeekdayTemplate(place?.openingHours),
  );
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<PlaceCityOption>>(
    initialCity ? [toCityOption(initialCity)] : [],
  );
  const [citiesError, setCitiesError] = useState('');
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const actionHandler = edit ? updatePlace : createPlace;
  const [actionState, formAction, pending] = useActionState<
    PlaceActionState,
    FormData
  >(actionHandler, INITIAL_ACTION_STATE);
  const submitLabel = edit ? 'Update place' : 'Create place';
  const lastUpdatedTimestamp = place?.updatedAt ?? place?.createdAt ?? null;

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
  const selectedCity = useMemo(
    function getSelectedCity() {
      return cityOptions.find(function findSelectedCity(city) {
        return city.id === resolvedCityId;
      });
    },
    [cityOptions, resolvedCityId],
  );
  const resolvedSportId = useMemo(
    function getResolvedSportId() {
      const hasSelectedSport = sortedSports.some(function hasSport(sport) {
        return sport.id === selectedSportId;
      });

      if (hasSelectedSport) {
        return selectedSportId;
      }

      return sortedSports[0]?.id ?? '';
    },
    [selectedSportId, sortedSports],
  );
  const serializedOpeningHours = useMemo(
    function getSerializedOpeningHours() {
      return serializeOpeningHours(openingHours);
    },
    [openingHours],
  );

  useEffect(
    function syncProvinceSelection() {
      if (resolvedProvince === selectedProvince) {
        return;
      }

      setSelectedProvince(resolvedProvince);
      setSelectedCityId('');
    },
    [resolvedProvince, selectedProvince],
  );

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

          console.error('Failed to load cities for place form', error);
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
          'We could not save the place.';
        toast.error(errorMessage);
        return;
      }

      if (actionState.status === 'success') {
        if (edit) {
          toast.success('Place updated successfully.');
          return;
        }

        toast.success('Place created successfully.');

        if (actionState.placeId) {
          router.push(NAVIGATION.PLACE_BY_ID(actionState.placeId));
          return;
        }

        router.push(NAVIGATION.PLACES);
      }
    },
    [actionState.error, actionState.placeId, actionState.status, edit, router],
  );

  function handleInputChange(
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
  }

  function handleContinentChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedContinent(event.target.value as City['continent']);
    setSelectedCountryCode('');
    setSelectedProvince('');
    setSelectedCityId('');
    setCityOptions([]);
  }

  function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCountryCode(event.target.value);
    setSelectedProvince('');
    setSelectedCityId('');
    setCityOptions([]);
  }

  function handleProvinceChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedProvince(event.target.value);
    setSelectedCityId('');
  }

  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCityId(event.target.value);
  }

  function handleAddOpeningHourRange(day: PlaceOpeningHourDay) {
    setOpeningHours(function updatePrevious(previous) {
      return previous.map(function updateDay(entry) {
        if (entry.day !== day) {
          return entry;
        }

        return {
          ...entry,
          ranges: [...entry.ranges, { opensAt: '', closesAt: '' }],
        };
      });
    });
  }

  function handleRemoveOpeningHourRange(
    day: PlaceOpeningHourDay,
    rangeIndex: number,
  ) {
    setOpeningHours(function updatePrevious(previous) {
      return previous.map(function updateDay(entry) {
        if (entry.day !== day) {
          return entry;
        }

        return {
          ...entry,
          ranges: entry.ranges.filter(function filterRange(_, index) {
            return index !== rangeIndex;
          }),
        };
      });
    });
  }

  function handleOpeningHourRangeChange(
    day: PlaceOpeningHourDay,
    rangeIndex: number,
    field: keyof PlaceOpeningHourRange,
    value: string,
  ) {
    setOpeningHours(function updatePrevious(previous) {
      return previous.map(function updateDay(entry) {
        if (entry.day !== day) {
          return entry;
        }

        return {
          ...entry,
          ranges: entry.ranges.map(function updateRange(range, index) {
            if (index !== rangeIndex) {
              return range;
            }

            return {
              ...range,
              [field]: value,
            };
          }),
        };
      });
    });
  }

  function handleWeekdayTemplateChange(
    field: keyof WeekdayTemplateState,
    value: string,
  ) {
    setWeekdayTemplate(function updatePrevious(previous) {
      return {
        ...previous,
        [field]: value,
      };
    });
  }

  function handleApplyWeekdayTemplate() {
    const nextRanges = buildRangesFromWeekdayTemplate(weekdayTemplate);

    setOpeningHours(function updatePrevious(previous) {
      return previous.map(function updateDay(entry) {
        if (!WEEKDAY_DAYS.includes(entry.day)) {
          return entry;
        }

        return {
          ...entry,
          ranges: nextRanges,
        };
      });
    });
  }

  const isSubmitDisabled =
    pending ||
    isCitiesPending ||
    sortedSports.length === 0 ||
    filteredCountries.length === 0 ||
    cityOptions.length === 0 ||
    !selectedCity ||
    !resolvedSportId;

  return (
    <Form action={formAction}>
      {edit && place ? (
        <input type='hidden' name='placeId' value={place.id} />
      ) : null}

      <input type='hidden' name='cityID' value={selectedCity?.id ?? ''} />
      <input
        type='hidden'
        name='openingHours'
        value={serializedOpeningHours}
      />

      <Grid gap={32}>
        <Section>
          <Grid gap={16} columns={2}>
            <TextInput
              label='Place name'
              name='name'
              placeholder='Padel Indoor Barcelona'
              value={formValues.name}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <Select
              label='Sport'
              name='sportID'
              value={resolvedSportId}
              onChange={event => setSelectedSportId(event.target.value)}
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
            <TextInput
              label='Owner ID'
              name='ownerID'
              placeholder='Owner identifier'
              value={formValues.ownerID}
              onChange={handleInputChange}
              required
              disabled={pending}
            />
            <Select
              label='Visibility'
              name='visibility'
              value={formValues.visibility}
              onChange={handleInputChange}
              required
              disabled={pending}
            >
              <option value='PUBLIC'>Public</option>
              <option value='PRIVATE'>Private</option>
            </Select>
            <TextArea
              label='Description'
              name='description'
              placeholder='Indoor courts with social leagues and academy.'
              value={formValues.description}
              onChange={handleInputChange}
              disabled={pending}
              rows={4}
              className='grid-column--2'
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
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
              disabled={pending || isCitiesPending || cityOptions.length === 0}
            >
              {cityOptions.map(function renderCity(city) {
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
              {`The place will be linked to ${selectedCity.name}, ${selectedCity.province ?? selectedCity.country}.`}
            </Text>
          ) : null}

          {selectedCity ? null : (
            <Text size='small' color='gray'>
              {citiesError ||
                (isCitiesPending
                  ? 'Loading cities for the selected province.'
                  : 'Select a province and then a city to define the place location.')}
            </Text>
          )}
        </Section>

        <Section>
          <Grid gap={16}>
            <Text size='small' color='gray'>
              Configure opening hours by day. You can add multiple time ranges
              to the same day.
            </Text>

            <Grid
              gap={16}
              className='padding-block--12 border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
            >
              <Text weight='semibold'>Monday to Friday pattern</Text>
              <Text size='small' color='gray'>
                Use this to prefill the same schedule for weekdays. You can
                still tweak individual days below afterwards.
              </Text>

              <Grid columns={2} gap={16}>
                <TextInput
                  label='Weekday opens at'
                  type='time'
                  value={weekdayTemplate.firstOpensAt}
                  onChange={event =>
                    handleWeekdayTemplateChange(
                      'firstOpensAt',
                      event.target.value,
                    )
                  }
                  disabled={pending}
                />
                <TextInput
                  label='Weekday closes at'
                  type='time'
                  value={weekdayTemplate.firstClosesAt}
                  onChange={event =>
                    handleWeekdayTemplateChange(
                      'firstClosesAt',
                      event.target.value,
                    )
                  }
                  disabled={pending}
                />
                <TextInput
                  label='Second range opens at'
                  type='time'
                  value={weekdayTemplate.secondOpensAt}
                  onChange={event =>
                    handleWeekdayTemplateChange(
                      'secondOpensAt',
                      event.target.value,
                    )
                  }
                  disabled={pending}
                />
                <TextInput
                  label='Second range closes at'
                  type='time'
                  value={weekdayTemplate.secondClosesAt}
                  onChange={event =>
                    handleWeekdayTemplateChange(
                      'secondClosesAt',
                      event.target.value,
                    )
                  }
                  disabled={pending}
                />
              </Grid>

              <Grid display='flex' gap={8}>
                <Button
                  type='button'
                  icon='update'
                  onClick={handleApplyWeekdayTemplate}
                  disabled={pending}
                >
                  Apply Monday-Friday
                </Button>
              </Grid>
            </Grid>

            {openingHours.map(function renderOpeningHourDay(daySchedule) {
              return (
                <Grid
                  key={daySchedule.day}
                  gap={16}
                  className='padding-block--12 border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'
                >
                  <Grid display='flex' gap={8} alignItems='center'>
                    <Text weight='semibold'>
                      {formatOpeningHourDayLabel(daySchedule.day)}
                    </Text>
                    <Button
                      type='button'
                      variant='borderless'
                      kind='primary'
                      icon='plus'
                      onClick={() => handleAddOpeningHourRange(daySchedule.day)}
                      disabled={pending}
                    >
                      Add range
                    </Button>
                  </Grid>

                  {daySchedule.ranges.length === 0 ? (
                    <Text size='small' color='gray'>
                      Closed
                    </Text>
                  ) : (
                    daySchedule.ranges.map(function renderRange(range, index) {
                      return (
                        <Grid
                          key={`${daySchedule.day}-${index}`}
                          columns={2}
                          gap={16}
                          className='align-items--end'
                        >
                          <TextInput
                            label='Opens at'
                            type='time'
                            value={range.opensAt}
                            onChange={event =>
                              handleOpeningHourRangeChange(
                                daySchedule.day,
                                index,
                                'opensAt',
                                event.target.value,
                              )
                            }
                            disabled={pending}
                          />
                          <TextInput
                            label='Closes at'
                            type='time'
                            value={range.closesAt}
                            onChange={event =>
                              handleOpeningHourRangeChange(
                                daySchedule.day,
                                index,
                                'closesAt',
                                event.target.value,
                              )
                            }
                            disabled={pending}
                          />
                          <Grid display='flex' gap={8}>
                            <Button
                              type='button'
                              variant='borderless'
                              kind='primary'
                              icon='remove'
                              onClick={() =>
                                handleRemoveOpeningHourRange(
                                  daySchedule.day,
                                  index,
                                )
                              }
                              disabled={pending}
                            >
                              Remove range
                            </Button>
                          </Grid>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
            <TextInput
              label='Latitude'
              name='latitude'
              placeholder='41.3851'
              value={formValues.latitude}
              onChange={handleInputChange}
              type='number'
              step='any'
              disabled={pending}
            />
            <TextInput
              label='Longitude'
              name='longitude'
              placeholder='2.1734'
              value={formValues.longitude}
              onChange={handleInputChange}
              type='number'
              step='any'
              disabled={pending}
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
            <TextInput
              label='Street'
              name='street'
              placeholder='Carrer de Balmes'
              value={formValues.street}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Street number'
              name='streetNumber'
              placeholder='12'
              value={formValues.streetNumber}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Postal code'
              name='postalCode'
              placeholder='08007'
              value={formValues.postalCode}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Formatted address'
              name='formattedAddress'
              placeholder='Carrer de Balmes 12, 08007 Barcelona'
              value={formValues.formattedAddress}
              onChange={handleInputChange}
              disabled={pending}
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
            <TextArea
              label='Amenities'
              name='amenities'
              placeholder='parking&#10;showers&#10;cafeteria'
              value={formValues.amenities}
              onChange={handleInputChange}
              disabled={pending}
              rows={4}
            />
            <TextArea
              label='Images'
              name='images'
              placeholder='One image URL per line'
              value={formValues.images}
              onChange={handleInputChange}
              disabled={pending}
              rows={4}
            />
            <TextInput
              label='Avatar URL'
              name='avatarURL'
              placeholder='https://example.com/place/avatar.jpg'
              value={formValues.avatarURL}
              onChange={handleInputChange}
              type='url'
              disabled={pending}
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
            <TextInput
              label='Website'
              name='website'
              placeholder='https://place.example.com'
              value={formValues.website}
              onChange={handleInputChange}
              type='url'
              disabled={pending}
            />
            <TextInput
              label='Phone'
              name='phone'
              placeholder='+34930000000'
              value={formValues.phone}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Email'
              name='email'
              placeholder='hola@place.example.com'
              value={formValues.email}
              onChange={handleInputChange}
              type='email'
              disabled={pending}
            />
            <TextInput
              label='Instagram'
              name='instagram'
              placeholder='@placeaccount'
              value={formValues.instagram}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Facebook'
              name='facebook'
              placeholder='placeaccount'
              value={formValues.facebook}
              onChange={handleInputChange}
              disabled={pending}
            />
          </Grid>
        </Section>

        <Section>
          <Grid gap={16} columns={2}>
            <TextInput
              label='Google Place ID'
              name='googlePlaceID'
              placeholder='google-place-123'
              value={formValues.googlePlaceID}
              onChange={handleInputChange}
              disabled={pending}
            />
            <TextInput
              label='Apple Place ID'
              name='applePlaceID'
              placeholder='apple-place-123'
              value={formValues.applePlaceID}
              onChange={handleInputChange}
              disabled={pending}
            />
          </Grid>

          <ButtonGroup gap={4} className='margin-top--24'>
            <Button
              type='submit'
              disabled={isSubmitDisabled}
              aria-busy={pending}
            >
              {pending
                ? edit
                  ? 'Updating place...'
                  : 'Creating place...'
                : submitLabel}
            </Button>
            <Button
              type='button'
              onClick={() => router.push(NAVIGATION.PLACES)}
              variant='borderless'
              kind='primary'
              disabled={pending}
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
