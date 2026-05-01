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

import { createClub } from '@/_actions/club/createClub';
import { formatDateForInput } from '@/_actions/club/payload';
import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { updateClub } from '@/_actions/club/updateClub';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';
import type { City } from '@/_types/city';
import type { Club, ClubActionState } from '@/_types/club';
import type { CountrySelectOption, ProvinceAdmin } from '@/_types/country';
import Card from '@/_components/Card';
import Title from '@/_components/typography/Title';
import Section from '@/_components/layout/Section';
import FieldSet from '@/_components/forms/Fieldset';
import Line from '@/_components/Line';

const INITIAL_STATE: ClubActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type ClubFormProps = Readonly<{
  club?: Club | null;
  countries: ReadonlyArray<CountrySelectOption>;
  countriesError?: string | null;
  initialProvinceName?: string | null;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  primaryStadiumOptions?: ReadonlyArray<SelectorOption>;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  selectedPrimaryStadiumLabel?: string | null;
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

function serializeFormData(
  formData: FormData,
): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

export default function ClubForm({
  club,
  countries,
  countriesError = null,
  initialProvinceName = null,
  initialCities = [],
  primaryStadiumOptions = [],
  selectedCountryLabel = null,
  selectedCityLabel = null,
  selectedPrimaryStadiumLabel = null,
  edit = false,
  cancelHref,
  successHref,
}: ClubFormProps) {
  const router = useRouter();
  const latestProvincesRequest = useRef(0);
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(
    club?.countryId ?? '',
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState(
    initialProvinceName ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(club?.cityId ?? '');
  const [selectedPrimaryStadiumId] = useState(club?.primaryStadiumId ?? '');
  const [isDissolved, setIsDissolved] = useState(club?.isDissolved ?? false);
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

  const mergedPrimaryStadiumOptions = useMemo(() => {
    if (
      !selectedPrimaryStadiumId ||
      primaryStadiumOptions.some(
        stadium => stadium.id === selectedPrimaryStadiumId,
      )
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
  }, [
    primaryStadiumOptions,
    selectedPrimaryStadiumId,
    selectedPrimaryStadiumLabel,
  ]);

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
      setProvincesError(
        'We could not load provinces for the selected country.',
      );
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

    console.log(`[ClubForm:${edit ? 'edit' : 'create'}] action result`, {
      status: actionState.status,
      clubId: actionState.clubId,
      error: actionState.error,
    });

    if (actionState.status === 'error') {
      console.error(
        `[ClubForm:${edit ? 'edit' : 'create'}] action error`,
        actionState.error,
      );
      toast.error(resolveClubErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Club updated successfully.');
      router.push(successHref ?? NAVIGATION.CLUB_BY_ID(club?.id ?? ''));
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
  }, [actionState.clubId, actionState.error, actionState.status, club?.id, edit, router, successHref]);

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

    router.push(NAVIGATION.CLUBS);
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

  const handleIsDissolvedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIsDissolved(event.target.checked);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const submittedFormData = new FormData(event.currentTarget);
      console.log(
        `[ClubForm:${edit ? 'edit' : 'create'}] submitted values`,
        serializeFormData(submittedFormData),
      );
    },
    [edit],
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

  const hasPrimaryStadiumSelector = mergedPrimaryStadiumOptions.length > 0;

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      {edit && club ? (
        <>
          <input type='hidden' name='clubId' value={club.id} />
          <input type='hidden' name='original_name' value={club.name} />
          <input
            type='hidden'
            name='original_shortName'
            value={club.shortName ?? ''}
          />
          <input
            type='hidden'
            name='original_acronym'
            value={club.acronym ?? ''}
          />
          <input
            type='hidden'
            name='original_nativeName'
            value={club.nativeName ?? ''}
          />
          <input
            type='hidden'
            name='original_foundedAs'
            value={club.foundedAs ?? ''}
          />
          <input
            type='hidden'
            name='original_foundedAt'
            value={club.foundedAt ?? ''}
          />
          <input
            type='hidden'
            name='original_dissolvedAt'
            value={club.dissolvedAt ?? ''}
          />
          <input
            type='hidden'
            name='original_countryId'
            value={club.countryId ?? ''}
          />
          <input
            type='hidden'
            name='original_cityId'
            value={club.cityId ?? ''}
          />
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
          <input
            type='hidden'
            name='original_logoUrl'
            value={club.logoUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_heroImageUrl'
            value={club.heroImageUrl ?? ''}
          />
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

      <Card>
        <Grid gap={16} columns={2}>
          <Section>
            <Title size='small'>Club Information</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <Grid gap={8} columns={8}>
                  <TextInput
                    label='Club name'
                    name='name'
                    placeholder='e.g. Kashima Antlers Football Club'
                    defaultValue={club?.name ?? ''}
                    required
                    disabled={isPending}
                    className='grid-column--7'
                  />
                  <TextInput
                    label='Acronym'
                    name='acronym'
                    placeholder='Ex. KAA (optional)'
                    defaultValue={club?.acronym ?? ''}
                    disabled={isPending}
                    className='width--100'
                  />
                </Grid>
                <TextInput
                  label='Short name'
                  name='shortName'
                  placeholder='Ex. Kajima Antlers (optional)'
                  defaultValue={club?.shortName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Native name'
                  name='nativeName'
                  placeholder='Ex. 鹿島アントラーズ (optional)'
                  defaultValue={club?.nativeName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Founded as'
                  name='foundedAs'
                  placeholder='Ex. Sumitomo Metal Football Club (optional)'
                  defaultValue={club?.foundedAs ?? ''}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <TextInput
                  label='Founded at'
                  name='foundedAt'
                  type='date'
                  defaultValue={formatDateForInput(club?.foundedAt)}
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
              </Grid>
            </FieldSet>
            <Line />
            <FieldSet>
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
            </FieldSet>
          </Section>
          <Section>
            <Title size='small'>Location</Title>
            <FieldSet>
              <Grid gap={8} columns={3}>
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
                  value={selectedProvinceName}
                  onChange={handleProvinceChange}
                  disabled={
                    isPending || !selectedCountryId || isProvincesPending
                  }
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
            <Title size='small' className='margin-top--16'>
              Other Information
            </Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
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
              </Grid>
            </FieldSet>
          </Section>
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
            <TextInput
              label='Slug'
              defaultValue={club.slug}
              readOnly
              disabled
            />
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
      </Card>
    </Form>
  );
}
