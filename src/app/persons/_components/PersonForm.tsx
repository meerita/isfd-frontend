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
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
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

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

function formatNumberForInput(value: number | null | undefined): string {
  return typeof value === 'number' ? String(value) : '';
}

export default function PersonForm({
  person,
  countries,
  countriesError = null,
  selectedPrimaryNationalityCountryLabel = null,
  edit = false,
}: PersonFormProps) {
  const router = useRouter();
  const [selectedPrimaryNationalityCountryId, setSelectedPrimaryNationalityCountryId] =
    useState(person?.primaryNationalityCountryId ?? '');
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

  const countryOptions = useMemo(() => {
    if (
      !selectedPrimaryNationalityCountryId ||
      countries.some(
        country => country.id === selectedPrimaryNationalityCountryId,
      )
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
  }, [
    countries,
    selectedPrimaryNationalityCountryId,
    selectedPrimaryNationalityCountryLabel,
  ]);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolvePersonErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Person updated successfully.');
      router.refresh();
      return;
    }

    toast.success('Person created successfully.');
    if (actionState.personId) {
      router.push(NAVIGATION.PERSON_BY_ID(actionState.personId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.PERSONS);
    router.refresh();
  }, [actionState.error, actionState.personId, actionState.status, edit, router]);

  const handleCancel = useCallback(() => {
    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.PERSONS);
  }, [router]);

  const handleCountryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedPrimaryNationalityCountryId(event.target.value);
    },
    [],
  );

  const handleIsDeceasedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIsDeceased(event.target.checked);
    },
    [],
  );

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? 'Countries are currently unavailable.'
      : undefined;

  return (
    <Form action={formAction}>
      {edit && person ? (
        <>
          <input type='hidden' name='personId' value={person.id} />
          <input type='hidden' name='original_fullName' value={person.fullName} />
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
          <input type='hidden' name='original_lastName' value={person.lastName ?? ''} />
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
          <input type='hidden' name='original_knownAs' value={person.knownAs ?? ''} />
          <input
            type='hidden'
            name='original_nativeFullName'
            value={person.nativeFullName ?? ''}
          />
          <input type='hidden' name='original_gender' value={person.gender ?? ''} />
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
        <Grid gap={16}>
          <Section>
            <Title size='small'>Identity</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <TextInput
                  label='Full name'
                  name='fullName'
                  defaultValue={person?.fullName ?? ''}
                  required
                  disabled={isPending}
                />
                <TextInput
                  label='Display name'
                  name='displayName'
                  defaultValue={person?.displayName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='First name'
                  name='firstName'
                  defaultValue={person?.firstName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Middle name'
                  name='middleName'
                  defaultValue={person?.middleName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Last name'
                  name='lastName'
                  defaultValue={person?.lastName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Second surname'
                  name='secondSurname'
                  defaultValue={person?.secondSurname ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Known as'
                  name='knownAs'
                  defaultValue={person?.knownAs ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Native full name'
                  name='nativeFullName'
                  defaultValue={person?.nativeFullName ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Gender'
                  name='gender'
                  defaultValue={person?.gender ?? ''}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
          </Section>

          <Section>
            <Title size='small'>Background</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <TextInput
                  label='Birth date'
                  name='birthDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.birthDate)}
                  disabled={isPending}
                />
                <TextInput
                  label='Death date'
                  name='deathDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.deathDate)}
                  disabled={isPending || !isDeceased}
                />
                <TextInput
                  label='Birth location ID'
                  name='birthLocationId'
                  defaultValue={person?.birthLocationId ?? ''}
                  disabled={isPending}
                />
                <Select
                  label='Primary nationality country'
                  name='primaryNationalityCountryId'
                  value={selectedPrimaryNationalityCountryId}
                  onChange={handleCountryChange}
                  disabled={isPending || Boolean(countriesError)}
                  error={Boolean(countriesError)}
                  helperText={countryHelperText}
                >
                  <option value=''>No country</option>
                  {countryOptions.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
                <NumberInput
                  label='Height (cm)'
                  name='heightCm'
                  type='number'
                  min='0'
                  step='0.1'
                  defaultValue={formatNumberForInput(person?.heightCm)}
                  disabled={isPending}
                />
                <NumberInput
                  label='Weight (kg)'
                  name='weightKg'
                  type='number'
                  min='0'
                  step='0.1'
                  defaultValue={formatNumberForInput(person?.weightKg)}
                  disabled={isPending}
                />
                <TextInput
                  label='Hair color'
                  name='hairColor'
                  defaultValue={person?.hairColor ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Ethnicity'
                  name='ethnicity'
                  defaultValue={person?.ethnicity ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Skin color'
                  name='skinColor'
                  defaultValue={person?.skinColor ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Dominant foot'
                  name='dominantFoot'
                  defaultValue={person?.dominantFoot ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Current profession'
                  name='currentProfession'
                  defaultValue={person?.currentProfession ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Professional debut date'
                  name='professionalDivisionDebutDate'
                  type='date'
                  defaultValue={formatDateForInput(
                    person?.professionalDivisionDebutDate,
                  )}
                  disabled={isPending}
                />
                <TextInput
                  label='Retirement date'
                  name='retirementDate'
                  type='date'
                  defaultValue={formatDateForInput(person?.retirementDate)}
                  disabled={isPending}
                />
                <CheckBoxInput
                  label='Deceased'
                  name='isDeceased'
                  value='true'
                  defaultChecked={person?.isDeceased ?? false}
                  onChange={handleIsDeceasedChange}
                  disabled={isPending}
                />
                <CheckBoxInput
                  label='Active'
                  name='isActive'
                  value='true'
                  defaultChecked={person?.isActive ?? true}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
          </Section>

          <Section>
            <Title size='small'>Media</Title>
            <FieldSet>
              <Grid gap={8} columns={2}>
                <TextInput
                  label='Avatar image URL'
                  name='avatarImageUrl'
                  type='url'
                  placeholder='https://...'
                  defaultValue={person?.avatarImageUrl ?? ''}
                  disabled={isPending}
                />
                <TextInput
                  label='Hero image URL'
                  name='heroImageUrl'
                  type='url'
                  placeholder='https://...'
                  defaultValue={person?.heroImageUrl ?? ''}
                  disabled={isPending}
                />
              </Grid>
            </FieldSet>
          </Section>

          {edit && person ? (
            <Section>
              <Title size='small'>Metadata</Title>
              <FieldSet>
                <Grid gap={8} columns={2}>
                  <TextInput label='ID' defaultValue={person.id} readOnly disabled />
                  <TextInput label='Slug' defaultValue={person.slug} readOnly disabled />
                  <TextInput
                    label='Created at'
                    defaultValue={formatDateTime(person.createdAt)}
                    readOnly
                    disabled
                  />
                  <TextInput
                    label='Updated at'
                    defaultValue={formatDateTime(person.updatedAt)}
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
                  ? 'Updating person...'
                  : 'Creating person...'
                : edit
                  ? 'Update person'
                  : 'Create person'}
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
        </Grid>
      </Card>
    </Form>
  );
}
