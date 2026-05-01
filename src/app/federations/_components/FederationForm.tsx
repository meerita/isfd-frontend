/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { createFederation } from '@/_actions/federation/createFederation';
import { updateFederation } from '@/_actions/federation/updateFederation';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { resolveLocalizedFederationErrorMessage } from '@/_constants/federationErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type { Federation, FederationActionState } from '@/_types/federation';
import Card from '@/_components/Card';
import Title from '@/_components/typography/Title';

const INITIAL_STATE: FederationActionState = { status: 'idle' };

type FederationFormProps = Readonly<{
  federation?: Federation | null;
  countries: ReadonlyArray<Pick<Country, 'id' | 'name'>>;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  countriesError?: string | null;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

function resolveGeoErrorMessage(message?: string): string {
  return message || 'We could not load cities for the selected country.';
}

export default function FederationForm({
  federation,
  countries,
  initialCities = [],
  countriesError = null,
  selectedCountryLabel = null,
  selectedCityLabel = null,
  edit = false,
  cancelHref,
  successHref,
}: FederationFormProps) {
  const router = useRouter();
  const { dictionary } = useI18n();
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(
    federation?.countryId ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(
    federation?.cityId ?? '',
  );
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialCities.map(city => ({ id: city.id, name: city.name })),
  );
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [citiesError, setCitiesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    FederationActionState,
    FormData
  >(updateFederation, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    FederationActionState,
    FormData
  >(createFederation, INITIAL_STATE);

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

  const mergedCityOptions = useMemo(() => {
    if (
      !selectedCityId ||
      cityOptions.some(city => city.id === selectedCityId)
    ) {
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

    setCityOptions(
      response.data.map(city => ({ id: city.id, name: city.name })),
    );
    setCitiesError('');
    setIsCitiesPending(false);
  }, []);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(
        resolveLocalizedFederationErrorMessage(
          actionState.error,
          dictionary.federations.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (edit) {
      toast.success('Federation updated successfully.');
      router.push(
        successHref ?? NAVIGATION.FEDERATION_BY_ID(federation?.id ?? ''),
      );
      router.refresh();
      return;
    }

    toast.success('Federation created successfully.');
    if (actionState.federationId) {
      router.push(NAVIGATION.FEDERATION_BY_ID(actionState.federationId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.FEDERATIONS);
    router.refresh();
  }, [
    actionState.error,
    actionState.federationId,
    actionState.status,
    dictionary.common.unexpectedError,
    dictionary.federations.errors,
    edit,
    federation?.id,
    router,
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

    router.push(NAVIGATION.FEDERATIONS);
  }, [cancelHref, router]);

  const handleCountryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextCountryId = event.target.value;
      setSelectedCountryId(nextCountryId);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');
      void loadCitiesForCountry(nextCountryId);
    },
    [loadCitiesForCountry],
  );

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCityId(event.target.value);
    },
    [],
  );

  let cityHelperText: string | undefined;
  if (selectedCountryId === '') {
    cityHelperText = 'Select a country to enable cities.';
  } else if (isCitiesPending) {
    cityHelperText = 'Loading cities...';
  } else if (citiesError) {
    cityHelperText = citiesError;
  } else if (mergedCityOptions.length === 0) {
    cityHelperText = 'No cities available for the selected country.';
  }

  let countryHelperText: string | undefined;
  if (countriesError) {
    countryHelperText = countriesError;
  } else if (countryOptions.length === 0) {
    countryHelperText = 'Countries are currently unavailable.';
  }

  return (
    <Card>
      <Title size='small'>
        {edit ? 'Edit Federation' : 'Create Federation'}
      </Title>
      <Form action={formAction}>
        {edit && federation ? (
          <input type='hidden' name='federationId' value={federation.id} />
        ) : null}

        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Federation name'
              name='name'
              placeholder='e.g. Royal Spanish Football Federation'
              defaultValue={federation?.name ?? ''}
              required
              disabled={isPending}
            />
            <Select
              label='Federation level'
              name='federationLevel'
              defaultValue={federation?.federationLevel ?? 'NATIONAL'}
              disabled={isPending}
              required
            >
              <option value='WORLD'>World</option>
              <option value='CONTINENTAL'>Continental</option>
              <option value='NATIONAL'>National</option>
            </Select>
            <TextInput
              label='Native name'
              name='nativeName'
              placeholder='Optional native name'
              defaultValue={federation?.nativeName ?? ''}
              disabled={isPending}
            />
            <TextInput
              label='Short name'
              name='shortName'
              placeholder='Optional short name'
              defaultValue={federation?.shortName ?? ''}
              disabled={isPending}
            />
            <TextInput
              label='Acronym'
              name='acronym'
              placeholder='Optional acronym'
              defaultValue={federation?.acronym ?? ''}
              disabled={isPending}
            />
            <TextInput
              label='Foundation date'
              name='foundationDate'
              type='date'
              defaultValue={formatDateForInput(federation?.foundationDate)}
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
            <TextInput
              label='Official website URL'
              name='officialWebsiteUrl'
              type='url'
              placeholder='https://...'
              defaultValue={federation?.officialWebsiteUrl ?? ''}
              disabled={isPending}
            />
            <TextInput
              label='Icon URL'
              name='iconUrl'
              type='url'
              placeholder='https://...'
              defaultValue={federation?.iconUrl ?? ''}
              disabled={isPending}
            />
            <TextInput
              label='Hero image URL'
              name='heroImageUrl'
              type='url'
              placeholder='https://...'
              defaultValue={federation?.heroImageUrl ?? ''}
              disabled={isPending}
            />
            <CheckBoxInput
              label='Active'
              name='isActive'
              value='true'
              defaultChecked={federation?.isActive ?? true}
              disabled={isPending}
            />
            <TextArea
              label='Description'
              name='description'
              placeholder='Optional description'
              defaultValue={federation?.description ?? ''}
              disabled={isPending}
              rows={6}
              className='grid-column--2'
            />
          </Grid>

          {edit && federation ? (
            <Grid gap={8} columns={2} className='margin-top--16'>
              <TextInput
                label='ID'
                defaultValue={federation.id}
                readOnly
                disabled
              />
              <TextInput
                label='Slug'
                defaultValue={federation.slug}
                readOnly
                disabled
              />
              <TextInput
                label='Created at'
                defaultValue={formatDateTime(federation.createdAt)}
                readOnly
                disabled
              />
              <TextInput
                label='Updated at'
                defaultValue={formatDateTime(federation.updatedAt)}
                readOnly
                disabled
              />
            </Grid>
          ) : null}

          <ButtonGroup gap={4} className='margin-top--24'>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending
                ? edit
                  ? 'Updating federation...'
                  : 'Creating federation...'
                : edit
                  ? 'Update federation'
                  : 'Create federation'}
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
    </Card>
  );
}
