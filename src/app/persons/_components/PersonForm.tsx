/** @format */
/**
 * @file src/app/persons/_components/PersonForm.tsx
 * @description Renders the localized create and edit person form.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

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
import type { Person, PersonActionState } from '@/_types/person';

const INITIAL_STATE: PersonActionState = { status: 'idle' };

type PersonFormProps = Readonly<{
  person?: Person | null;
  countries: ReadonlyArray<CountrySelectOption>;
  countriesError?: string | null;
  selectedPrimaryNationalityCountryLabel?: string | null;
  edit?: boolean;
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
  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

export default function PersonForm({
  person,
  countries,
  countriesError = null,
  selectedPrimaryNationalityCountryLabel = null,
  edit = false,
}: PersonFormProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary, locale } = useI18n();

  const [
    selectedPrimaryNationalityCountryId,
    setSelectedPrimaryNationalityCountryId,
  ] = useState(person?.primaryNationalityCountryId ?? '');
  const [isDeceased, setIsDeceased] = useState(person?.isDeceased ?? false);

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
        countries.some(function countryMatchesSelection(country) {
          return country.id === selectedPrimaryNationalityCountryId;
        })
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

  useEffect(
    function syncActionFeedback(): void {
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
        router.refresh();
        return;
      }

      toast.success(dictionary.persons.form.createSuccess);

      if (actionState.personId) {
        router.push(NAVIGATION.PERSON_BY_ID(actionState.personId));
        router.refresh();
        return;
      }

      router.push(NAVIGATION.PERSONS);
      router.refresh();
    },
    [
      actionState.error,
      actionState.personId,
      actionState.status,
      dictionary.common.unexpectedError,
      dictionary.persons.errors,
      dictionary.persons.form.createSuccess,
      dictionary.persons.form.updateSuccess,
      edit,
      router,
    ],
  );

  const handleCancel = useCallback(
    function handleCancel(): void {
      if (
        globalThis.window?.history.length &&
        globalThis.window.history.length > 1
      ) {
        router.back();
        return;
      }

      router.push(NAVIGATION.PERSONS);
    },
    [router],
  );

  const handleCountryChange = useCallback(function handleCountryChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    setSelectedPrimaryNationalityCountryId(event.target.value);
  }, []);

  const handleIsDeceasedChange = useCallback(function handleIsDeceasedChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setIsDeceased(event.target.checked);
  }, []);

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? dictionary.persons.form.countriesUnavailable
      : undefined;

  return (
    <Form action={formAction}>
      {edit && person ? (
        <>
          <input type='hidden' name='personId' value={person.id} />
          <input
            type='hidden'
            name='original_fullName'
            value={person.fullName}
          />
          <input
            type='hidden'
            name='original_firstName'
            value={person.firstName ?? ''}
          />
          <input
            type='hidden'
            name='original_middleName'
            value={person.middleName ?? ''}
          />
          <input
            type='hidden'
            name='original_lastName'
            value={person.lastName ?? ''}
          />
          <input
            type='hidden'
            name='original_secondSurname'
            value={person.secondSurname ?? ''}
          />
          <input
            type='hidden'
            name='original_displayName'
            value={person.displayName ?? ''}
          />
          <input
            type='hidden'
            name='original_knownAs'
            value={person.knownAs ?? ''}
          />
          <input
            type='hidden'
            name='original_nativeFullName'
            value={person.nativeFullName ?? ''}
          />
          <input
            type='hidden'
            name='original_gender'
            value={person.gender ?? ''}
          />
          <input
            type='hidden'
            name='original_birthDate'
            value={person.birthDate ?? ''}
          />
          <input
            type='hidden'
            name='original_deathDate'
            value={person.deathDate ?? ''}
          />
          <input
            type='hidden'
            name='original_birthLocationId'
            value={person.birthLocationId ?? ''}
          />
          <input
            type='hidden'
            name='original_primaryNationalityCountryId'
            value={person.primaryNationalityCountryId ?? ''}
          />
          <input
            type='hidden'
            name='original_heightCm'
            value={formatNumberForInput(person.heightCm)}
          />
          <input
            type='hidden'
            name='original_weightKg'
            value={formatNumberForInput(person.weightKg)}
          />
          <input
            type='hidden'
            name='original_hairColor'
            value={person.hairColor ?? ''}
          />
          <input
            type='hidden'
            name='original_ethnicity'
            value={person.ethnicity ?? ''}
          />
          <input
            type='hidden'
            name='original_skinColor'
            value={person.skinColor ?? ''}
          />
          <input
            type='hidden'
            name='original_dominantFoot'
            value={person.dominantFoot ?? ''}
          />
          <input
            type='hidden'
            name='original_currentProfession'
            value={person.currentProfession ?? ''}
          />
          <input
            type='hidden'
            name='original_professionalDivisionDebutDate'
            value={person.professionalDivisionDebutDate ?? ''}
          />
          <input
            type='hidden'
            name='original_retirementDate'
            value={person.retirementDate ?? ''}
          />
          <input
            type='hidden'
            name='original_avatarImageUrl'
            value={person.avatarImageUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_heroImageUrl'
            value={person.heroImageUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_isDeceased'
            value={person.isDeceased ? 'true' : 'false'}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={person.isActive ? 'true' : 'false'}
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
                  name='fullName'
                  defaultValue={person?.fullName ?? ''}
                  required
                  placeholder={dictionary.persons.form.placeholders.fullName}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.displayName}
                  name='displayName'
                  placeholder={dictionary.persons.form.placeholders.displayName}
                  defaultValue={person?.displayName ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.firstName}
                  name='firstName'
                  placeholder={dictionary.persons.form.placeholders.firstName}
                  defaultValue={person?.firstName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.middleName}
                  name='middleName'
                  placeholder={dictionary.persons.form.placeholders.middleName}
                  defaultValue={person?.middleName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.lastName}
                  name='lastName'
                  placeholder={dictionary.persons.form.placeholders.lastName}
                  defaultValue={person?.lastName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.secondSurname}
                  name='secondSurname'
                  placeholder={
                    dictionary.persons.form.placeholders.secondSurname
                  }
                  defaultValue={person?.secondSurname ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.knownAs}
                  name='knownAs'
                  placeholder={dictionary.persons.form.placeholders.knownAs}
                  defaultValue={person?.knownAs ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                />
                <TextInput
                  label={dictionary.persons.form.nativeFullName}
                  name='nativeFullName'
                  defaultValue={person?.nativeFullName ?? ''}
                  disabled={isPending}
                  placeholder={
                    dictionary.persons.form.placeholders.nativeFullName
                  }
                  className='grid-column--2'
                  title={dictionary.persons.form.titles.nativeFullName}
                />
              </Grid>
            </FieldSet>

            <CheckBoxInput
              label={dictionary.persons.form.activeLabel}
              name='isActive'
              value='true'
              defaultChecked={person?.isActive ?? true}
              disabled={isPending}
              placeholder={dictionary.persons.form.activeHelper}
            />

            <Line />

            <Title size='small'>{dictionary.persons.form.vitals}</Title>

            <FieldSet>
              <Grid gap={8} columns={4} alignItems='end'>
                <TextInput
                  label={dictionary.persons.form.birthDate}
                  name='birthDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.birthDate)}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.deathDate}
                  name='deathDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.deathDate)}
                  disabled={isPending || !isDeceased}
                />
                <CheckBoxInput
                  label={dictionary.persons.form.deceased}
                  name='isDeceased'
                  value='true'
                  defaultChecked={person?.isDeceased ?? false}
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
                  defaultValue={person?.gender ?? 'MALE'}
                  disabled={isPending}
                >
                  <option value=''>{dictionary.persons.form.noGender}</option>
                  {getPersonGenderOptions().map(
                    function renderGenderOption(option): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
                </Select>

                <NumberInput
                  label={dictionary.persons.form.heightCm}
                  name='heightCm'
                  type='number'
                  min='0'
                  step='0.1'
                  defaultValue={formatNumberForInput(person?.heightCm)}
                  disabled={isPending}
                />
                <NumberInput
                  label={dictionary.persons.form.weightKg}
                  name='weightKg'
                  type='number'
                  min='0'
                  step='0.1'
                  defaultValue={formatNumberForInput(person?.weightKg)}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>

            <FieldSet>
              <Grid gap={8} columns={4}>
                <Select
                  label={dictionary.persons.form.hairColor}
                  name='hairColor'
                  defaultValue={person?.hairColor ?? ''}
                  disabled={isPending}
                >
                  <option value=''>
                    {dictionary.persons.form.noHairColor}
                  </option>
                  {getPersonHairColorOptions().map(
                    function renderHairOption(option): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
                </Select>

                <Select
                  label={dictionary.persons.form.ethnicity}
                  name='ethnicity'
                  defaultValue={person?.ethnicity ?? ''}
                  disabled={isPending}
                >
                  <option value=''>
                    {dictionary.persons.form.noEthnicity}
                  </option>
                  {getPersonEthnicityOptions().map(
                    function renderEthnicityOption(option): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
                </Select>

                <Select
                  label={dictionary.persons.form.skinColor}
                  name='skinColor'
                  defaultValue={person?.skinColor ?? ''}
                  disabled={isPending}
                >
                  <option value=''>
                    {dictionary.persons.form.noSkinColor}
                  </option>
                  {getPersonSkinColorOptions().map(
                    function renderSkinColorOption(option): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
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
                  name='birthLocationId'
                  defaultValue={person?.birthLocationId ?? ''}
                  disabled={isPending}
                />
                <Select
                  label={dictionary.persons.form.primaryNationalityCountry}
                  name='primaryNationalityCountryId'
                  value={selectedPrimaryNationalityCountryId}
                  onChange={handleCountryChange}
                  disabled={isPending || Boolean(countriesError)}
                  error={Boolean(countriesError)}
                  helperText={countryHelperText}
                  title={dictionary.persons.form.primaryNationalityCountryTitle}
                >
                  <option value=''>{dictionary.persons.form.noCountry}</option>
                  {countryOptions.map(
                    function renderCountryOption(country): React.JSX.Element {
                      return (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      );
                    },
                  )}
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
                  name='currentProfession'
                  defaultValue={person?.currentProfession ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                >
                  <option value=''>
                    {dictionary.persons.form.noCurrentProfession}
                  </option>
                  {getPersonCurrentProfessionOptions().map(
                    function renderProfessionOption(option): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
                </Select>

                <Select
                  label={dictionary.persons.form.dominantFoot}
                  name='dominantFoot'
                  defaultValue={person?.dominantFoot ?? ''}
                  disabled={isPending}
                  className='grid-column--2'
                >
                  <option value=''>
                    {dictionary.persons.form.noDominantFoot}
                  </option>
                  {getPersonDominantFootOptions().map(
                    function renderDominantFootOption(
                      option,
                    ): React.JSX.Element {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    },
                  )}
                </Select>

                <TextInput
                  label={dictionary.persons.form.professionalDebutDate}
                  name='professionalDivisionDebutDate'
                  type='date'
                  defaultValue={formatDateForInput(
                    person?.professionalDivisionDebutDate,
                  )}
                  disabled={isPending}
                />

                <TextInput
                  label={dictionary.persons.form.retirementDate}
                  name='retirementDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.retirementDate)}
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
                  name='avatarImageUrl'
                  type='url'
                  placeholder={
                    dictionary.persons.form.placeholders.avatarImageUrl
                  }
                  defaultValue={person?.avatarImageUrl ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label={dictionary.persons.form.heroImageUrl}
                  name='heroImageUrl'
                  type='url'
                  placeholder={
                    dictionary.persons.form.placeholders.heroImageUrl
                  }
                  defaultValue={person?.heroImageUrl ?? ''}
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
                    defaultValue={formatDateTime(person.createdAt, locale)}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label={dictionary.persons.form.updatedAt}
                    defaultValue={formatDateTime(person.updatedAt, locale)}
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
