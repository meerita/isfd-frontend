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

import { createClub } from '@/_actions/club/createClub';
import { updateClub } from '@/_actions/club/updateClub';
import { formatDateForInput } from '@/_actions/club/payload';
import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';
import type { City } from '@/_types/city';
import type { Club, ClubActionState } from '@/_types/club';
import type { Country } from '@/_types/country';

const INITIAL_STATE: ClubActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type ClubFormProps = Readonly<{
  club?: Club | null;
  countries: ReadonlyArray<Pick<Country, 'id' | 'name'>>;
  countriesError?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  primaryStadiumOptions?: ReadonlyArray<SelectorOption>;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  selectedPrimaryStadiumLabel?: string | null;
  edit?: boolean;
}>;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

function resolveGeoErrorMessage(message?: string): string {
  return message || 'We could not load cities for the selected country.';
}

export default function ClubForm({
  club,
  countries,
  countriesError = null,
  initialCities = [],
  primaryStadiumOptions = [],
  selectedCountryLabel = null,
  selectedCityLabel = null,
  selectedPrimaryStadiumLabel = null,
  edit = false,
}: ClubFormProps) {
  const router = useRouter();
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(club?.countryId ?? '');
  const [selectedCityId, setSelectedCityId] = useState(club?.cityId ?? '');
  const [selectedPrimaryStadiumId] = useState(club?.primaryStadiumId ?? '');
  const [isDissolved, setIsDissolved] = useState(club?.isDissolved ?? false);
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialCities.map(city => ({ id: city.id, name: city.name })),
  );
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [citiesError, setCitiesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    ClubActionState,
    FormData
  >(updateClub, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    ClubActionState,
    FormData
  >(createClub, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  const countryOptions = useMemo(() => {
    if (!selectedCountryId || countries.some(country => country.id === selectedCountryId)) {
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

  const mergedPrimaryStadiumOptions = useMemo(() => {
    if (
      !selectedPrimaryStadiumId ||
      primaryStadiumOptions.some(stadium => stadium.id === selectedPrimaryStadiumId)
    ) {
      return primaryStadiumOptions;
    }

    return [
      {
        id: selectedPrimaryStadiumId,
        name: selectedPrimaryStadiumLabel ?? selectedPrimaryStadiumId,
      },
      ...primaryStadiumOptions,
    ];
  }, [primaryStadiumOptions, selectedPrimaryStadiumId, selectedPrimaryStadiumLabel]);

  const loadCitiesForCountry = useCallback(async (countryId: string) => {
    const requestId = latestCitiesRequest.current + 1;
    latestCitiesRequest.current = requestId;

    if (!countryId) {
      setCityOptions([]);
      setCitiesError('');
      setIsCitiesPending(false);
      return;
    }

    setIsCitiesPending(true);
    setCitiesError('');

    const response = await getGeoCitiesByCountry(countryId);
    if (latestCitiesRequest.current !== requestId) return;

    if (response.error) {
      setCityOptions([]);
      setCitiesError(resolveGeoErrorMessage(response.error.error));
      setIsCitiesPending(false);
      return;
    }

    setCityOptions(response.data.map(city => ({ id: city.id, name: city.name })));
    setCitiesError('');
    setIsCitiesPending(false);
  }, []);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveClubErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Club updated successfully.');
      router.refresh();
      return;
    }

    toast.success('Club created successfully.');
    if (actionState.clubId) {
      router.push(NAVIGATION.CLUB_BY_ID(actionState.clubId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.CLUBS);
    router.refresh();
  }, [actionState.clubId, actionState.error, actionState.status, edit, router]);

  const handleCancel = useCallback(() => {
    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.CLUBS);
  }, [router]);

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextCountryId = event.target.value;
      setSelectedCountryId(nextCountryId);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');
      void loadCitiesForCountry(nextCountryId);
    },
    [loadCitiesForCountry],
  );

  const handleCityChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
  }, []);

  const handleIsDissolvedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIsDissolved(event.target.checked);
    },
    [],
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

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? 'Countries are currently unavailable.'
      : undefined;

  const hasPrimaryStadiumSelector = mergedPrimaryStadiumOptions.length > 0;

  return (
    <Form action={formAction}>
      {edit && club ? (
        <>
          <input type='hidden' name='clubId' value={club.id} />
          <input type='hidden' name='original_name' value={club.name} />
          <input type='hidden' name='original_shortName' value={club.shortName ?? ''} />
          <input type='hidden' name='original_acronym' value={club.acronym ?? ''} />
          <input type='hidden' name='original_nativeName' value={club.nativeName ?? ''} />
          <input type='hidden' name='original_foundedAs' value={club.foundedAs ?? ''} />
          <input type='hidden' name='original_foundedAt' value={club.foundedAt ?? ''} />
          <input type='hidden' name='original_dissolvedAt' value={club.dissolvedAt ?? ''} />
          <input type='hidden' name='original_countryId' value={club.countryId ?? ''} />
          <input type='hidden' name='original_cityId' value={club.cityId ?? ''} />
          <input
            type='hidden'
            name='original_primaryStadiumId'
            value={club.primaryStadiumId ?? ''}
          />
          <input
            type='hidden'
            name='original_officialWebsiteUrl'
            value={club.officialWebsiteUrl ?? ''}
          />
          <input type='hidden' name='original_logoUrl' value={club.logoUrl ?? ''} />
          <input type='hidden' name='original_heroImageUrl' value={club.heroImageUrl ?? ''} />
          <input
            type='hidden'
            name='original_isDissolved'
            value={club.isDissolved ? 'true' : 'false'}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={club.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Section>
        <Grid gap={8} columns={2}>
          <TextInput
            label='Club name'
            name='name'
            placeholder='e.g. Real Madrid Club de Fútbol'
            defaultValue={club?.name ?? ''}
            required
            disabled={isPending}
          />
          <TextInput
            label='Short name'
            name='shortName'
            placeholder='Optional short name'
            defaultValue={club?.shortName ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Acronym'
            name='acronym'
            placeholder='Optional acronym'
            defaultValue={club?.acronym ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Native name'
            name='nativeName'
            placeholder='Optional native name'
            defaultValue={club?.nativeName ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Founded as'
            name='foundedAs'
            placeholder='Optional original name'
            defaultValue={club?.foundedAs ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Founded at'
            name='foundedAt'
            type='date'
            defaultValue={formatDateForInput(club?.foundedAt)}
            disabled={isPending}
          />
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
            label='City'
            name='cityId'
            value={selectedCityId}
            onChange={handleCityChange}
            disabled={isPending || !selectedCountryId || isCitiesPending}
            helperText={cityHelperText}
            error={Boolean(citiesError)}
          >
            <option value=''>No city</option>
            {mergedCityOptions.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
          {hasPrimaryStadiumSelector ? (
            <Select
              label='Primary stadium'
              name='primaryStadiumId'
              defaultValue={club?.primaryStadiumId ?? ''}
              disabled={isPending}
            >
              <option value=''>No primary stadium</option>
              {mergedPrimaryStadiumOptions.map(stadium => (
                <option key={stadium.id} value={stadium.id}>
                  {stadium.name}
                </option>
              ))}
            </Select>
          ) : (
            <TextInput
              label='Primary stadium ID'
              name='primaryStadiumId'
              placeholder='Optional stadium UUID'
              defaultValue={club?.primaryStadiumId ?? ''}
              disabled={isPending}
            />
          )}
          <TextInput
            label='Official website URL'
            name='officialWebsiteUrl'
            type='url'
            placeholder='https://...'
            defaultValue={club?.officialWebsiteUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Logo URL'
            name='logoUrl'
            type='url'
            placeholder='https://...'
            defaultValue={club?.logoUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Hero image URL'
            name='heroImageUrl'
            type='url'
            placeholder='https://...'
            defaultValue={club?.heroImageUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Dissolved at'
            name='dissolvedAt'
            type='date'
            defaultValue={formatDateForInput(club?.dissolvedAt)}
            disabled={isPending || !isDissolved}
            helperText={
              isDissolved
                ? undefined
                : 'Enable "Dissolved" to set a dissolved date.'
            }
          />
          <CheckBoxInput
            label='Dissolved'
            name='isDissolved'
            value='true'
            defaultChecked={club?.isDissolved ?? false}
            disabled={isPending}
            onChange={handleIsDissolvedChange}
          />
          <CheckBoxInput
            label='Active'
            name='isActive'
            value='true'
            defaultChecked={club?.isActive ?? true}
            disabled={isPending}
          />
        </Grid>

        {edit && club ? (
          <Grid gap={8} columns={2} className='margin-top--16'>
            <TextInput label='ID' defaultValue={club.id} readOnly disabled />
            <TextInput label='Slug' defaultValue={club.slug} readOnly disabled />
            <TextInput
              label='Created at'
              defaultValue={formatDateTime(club.createdAt)}
              readOnly
              disabled
            />
            <TextInput
              label='Updated at'
              defaultValue={formatDateTime(club.updatedAt)}
              readOnly
              disabled
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4} className='margin-top--24'>
          <Button type='submit' disabled={isPending} aria-busy={isPending}>
            {isPending
              ? edit
                ? 'Updating club...'
                : 'Creating club...'
              : edit
                ? 'Update club'
                : 'Create club'}
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
      </Section>
    </Form>
  );
}
