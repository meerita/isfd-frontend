/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import type { CountrySelectOption } from '@/_types/country';
import type { PersonActionState, PersonAdminDetail } from '@/_types/person';

const INITIAL_STATE: PersonActionState = { status: 'idle' };

type PersonFormProps = Readonly<{
  person?: PersonAdminDetail | null;
  countries: ReadonlyArray<CountrySelectOption>;
  countriesError?: string | null;
  selectedPrimaryNationalityCountryLabel?: string | null;
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

function OriginalField({
  name,
  value,
}: Readonly<{
  name: string;
  value: string;
}>): React.JSX.Element {
  return <input type='hidden' name={`original_${name}`} value={value} />;
}

export default function PersonForm({
  person,
  countries,
  countriesError = null,
  selectedPrimaryNationalityCountryLabel = null,
  edit = false,
  cancelHref,
  successHref,
}: PersonFormProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary, locale } = useI18n();

  const [
    selectedPrimaryNationalityCountryId,
    setSelectedPrimaryNationalityCountryId,
  ] = useState(person?.primary_nationality_country_id ?? '');
  const [isDeceased, setIsDeceased] = useState(person?.is_deceased ?? false);

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

  const countryOptions = useMemo(
    function buildCountryOptions() {
      if (
        !selectedPrimaryNationalityCountryId ||
        countries.some(country => country.id === selectedPrimaryNationalityCountryId)
      ) {
        return countries;
      }

      return [
        {
          id: selectedPrimaryNationalityCountryId,
          name:
            selectedPrimaryNationalityCountryLabel ??
            selectedPrimaryNationalityCountryId,
        },
        ...countries,
      ];
    },
    [
      countries,
      selectedPrimaryNationalityCountryId,
      selectedPrimaryNationalityCountryLabel,
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

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setSelectedPrimaryNationalityCountryId(event.target.value);
    },
    [],
  );

  const handleIsDeceasedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setIsDeceased(event.target.checked);
    },
    [],
  );

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? dictionary.persons.form.countriesUnavailable
      : undefined;

  return (
    <Form action={formAction}>
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
            name='avatar_image_url'
            value={person.avatar_image_url ?? ''}
          />
          <OriginalField
            name='hero_image_url'
            value={person.hero_image_url ?? ''}
          />
          <OriginalField
            name='is_deceased'
            value={person.is_deceased ? 'true' : 'false'}
          />
          <OriginalField
            name='is_active'
            value={person.is_active ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={16} columns={2}>
          <Section>
            <Title size='small'>{dictionary.persons.form.identity}</Title>
            <FieldSet>
              <Grid gap={8} columns={4}>
                <TextInput
                  label={dictionary.persons.form.fullName}
                  name='full_name'
                  defaultValue={person?.full_name ?? ''}
                  required
                  placeholder={dictionary.persons.form.placeholders.fullName}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.displayName}
                  name='display_name'
                  placeholder={dictionary.persons.form.placeholders.displayName}
                  defaultValue={person?.display_name ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.firstName}
                  name='first_name'
                  placeholder={dictionary.persons.form.placeholders.firstName}
                  defaultValue={person?.first_name ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.middleName}
                  name='middle_name'
                  placeholder={dictionary.persons.form.placeholders.middleName}
                  defaultValue={person?.middle_name ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.lastName}
                  name='last_name'
                  placeholder={dictionary.persons.form.placeholders.lastName}
                  defaultValue={person?.last_name ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.secondSurname}
                  name='second_surname'
                  placeholder={dictionary.persons.form.placeholders.secondSurname}
                  defaultValue={person?.second_surname ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.knownAs}
                  name='known_as'
                  placeholder={dictionary.persons.form.placeholders.knownAs}
                  defaultValue={person?.known_as ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.nativeFullName}
                  name='native_full_name'
                  defaultValue={person?.native_full_name ?? ''}
                  disabled={isPending}
                  placeholder={dictionary.persons.form.placeholders.nativeFullName}
                  className='grid-column--2'
                  title={dictionary.persons.form.titles.nativeFullName}
                />
              </Grid>
            </FieldSet>

            <input type='hidden' name='is_active' value='false' />
            <CheckBoxInput
              label={dictionary.persons.form.activeLabel}
              name='is_active'
              value='true'
              defaultChecked={person?.is_active ?? true}
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
                  defaultValue={formatDateForInput(person?.birth_date)}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.deathDate}
                  name='death_date'
                  type='date'
                  defaultValue={formatDateForInput(person?.death_date)}
                  disabled={isPending || !isDeceased}
                />
                <input type='hidden' name='is_deceased' value='false' />
                <CheckBoxInput
                  label={dictionary.persons.form.deceased}
                  name='is_deceased'
                  value='true'
                  defaultChecked={person?.is_deceased ?? false}
                  onChange={handleIsDeceasedChange}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.gender}
                  name='gender'
                  defaultValue={person?.gender ?? ''}
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
                  defaultValue={formatNumberForInput(person?.height_cm)}
                  disabled={isPending}
                />
                <NumberInput
                  label={dictionary.persons.form.weightKg}
                  name='weight_kg'
                  type='number'
                  min='0'
                  step='1'
                  defaultValue={formatNumberForInput(person?.weight_kg)}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.hairColor}
                  name='hair_color'
                  defaultValue={person?.hair_color ?? ''}
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
                  defaultValue={person?.ethnicity ?? ''}
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
                  defaultValue={person?.skin_color ?? ''}
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
                <TextInput
                  label={dictionary.persons.form.birthLocationId}
                  name='birth_location_id'
                  defaultValue={person?.birth_location_id ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.currentCityId}
                  name='current_city_id'
                  defaultValue={person?.current_city_id ?? ''}
                  disabled={isPending}
                />
                <Select
                  label={dictionary.persons.form.primaryNationalityCountry}
                  name='primary_nationality_country_id'
                  value={selectedPrimaryNationalityCountryId}
                  onChange={handleCountryChange}
                  disabled={isPending || Boolean(countriesError)}
                  error={Boolean(countriesError)}
                  helperText={countryHelperText}
                  title={dictionary.persons.form.primaryNationalityCountryTitle}
                >
                  <option value=''>{dictionary.persons.form.noCountry}</option>
                  {countryOptions.map(country => (
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
                  defaultValue={person?.current_profession ?? ''}
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
                  defaultValue={person?.dominant_foot ?? ''}
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
                  defaultValue={formatDateForInput(
                    person?.professional_division_debut_date,
                  )}
                  disabled={isPending}
                />

                <TextInput
                  label={dictionary.persons.form.retirementDate}
                  name='retirement_date'
                  type='date'
                  defaultValue={formatDateForInput(person?.retirement_date)}
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
                  label={dictionary.persons.form.avatarImageUrl}
                  name='avatar_image_url'
                  type='url'
                  placeholder={dictionary.persons.form.placeholders.avatarImageUrl}
                  defaultValue={person?.avatar_image_url ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.heroImageUrl}
                  name='hero_image_url'
                  type='url'
                  placeholder={dictionary.persons.form.placeholders.heroImageUrl}
                  defaultValue={person?.hero_image_url ?? ''}
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
                    defaultValue={person.id}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.slug}
                    defaultValue={person.slug}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.createdAt}
                    defaultValue={formatDateTime(person.created_at, locale)}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.updatedAt}
                    defaultValue={formatDateTime(person.updated_at, locale)}
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
