/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import TextInput from '@/_components/forms/TextInput';
import Select from '@/_components/forms/Select';
import { createCountry } from '@/_actions/country/createCountry';
import { updateCountry } from '@/_actions/country/updateCountry';
import type { Country, CountryActionState } from '@/_types/country';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import CONTINENTS from '@/_constants/continents';

const INITIAL_STATE: CountryActionState = { status: 'idle' };

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  COUNTRY_SLUG_TAKEN: 'Country is already created.',
  COUNTRY_ISO2_CODE_TAKEN: 'ISO 2 code is already in use by another country.',
  COUNTRY_ISO3_CODE_TAKEN: 'ISO 3 code is already in use by another country.',
  COUNTRY_NOT_FOUND: 'Country not found.',
};

function resolveErrorMessage(error: CountryActionState['error']): string {
  if (!error) return 'Unexpected error.';
  return (
    ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}

type CountryFormProps = Readonly<{
  country?: Country | null;
  edit?: boolean;
}>;

export default function CountryForm({ country, edit = false }: CountryFormProps) {
  const router = useRouter();

  const [editState, editAction, editPending] = useActionState<CountryActionState, FormData>(
    updateCountry,
    INITIAL_STATE,
  );
  const [createState, createAction, createPending] = useActionState<CountryActionState, FormData>(
    createCountry,
    INITIAL_STATE,
  );

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  const submitLabel = isPending
    ? edit ? 'Updating...' : 'Creating...'
    : edit ? 'Update country' : 'Create country';

  useEffect(() => {
    if (actionState.status === 'error') {
      toast.error(resolveErrorMessage(actionState.error));
    }
  }, [actionState.error, actionState.status]);

  useEffect(() => {
    if (actionState.status === 'success') {
      router.push(NAVIGATION.COUNTRIES);
    }
  }, [actionState.status, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Form action={formAction}>
      {edit && country ? (
        <>
          <input type='hidden' name='countryId' value={country.id} />
          <input type='hidden' name='original_name' value={country.name} />
          <input type='hidden' name='original_iso2Code' value={country.iso2Code ?? ''} />
          <input type='hidden' name='original_iso3Code' value={country.iso3Code ?? ''} />
          <input type='hidden' name='original_continentCode' value={country.continentCode ?? ''} />
          <input type='hidden' name='original_flagImageUrl' value={country.flagImageUrl ?? ''} />
        </>
      ) : null}

      <Section>
        <Grid gap={8} columns={3}>
          <TextInput
            label='Country name'
            name='name'
            placeholder='e.g. Spain'
            defaultValue={country?.name ?? ''}
            required
            disabled={isPending}
          />
          {edit ? (
            <>
              <TextInput
                label='ISO 2 code'
                name='iso2Code'
                placeholder='e.g. ES'
                defaultValue={country?.iso2Code ?? ''}
                maxLength={2}
                disabled={isPending}
              />
              <TextInput
                label='ISO 3 code'
                name='iso3Code'
                placeholder='e.g. ESP'
                defaultValue={country?.iso3Code ?? ''}
                maxLength={3}
                disabled={isPending}
              />
            </>
          ) : null}
        </Grid>
        {edit ? (
          <Grid gap={8} columns={2}>
            <Select
              label='Continent'
              name='continentCode'
              defaultValue={country?.continentCode ?? ''}
              disabled={isPending}
            >
              <option value=''>— none —</option>
              {CONTINENTS.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
            <TextInput
              label='Flag image URL'
              name='flagImageUrl'
              placeholder='https://...'
              defaultValue={country?.flagImageUrl ?? ''}
              disabled={isPending}
            />
          </Grid>
        ) : null}
        <ButtonGroup gap={4}>
          <Button type='submit' disabled={isPending} aria-busy={isPending}>
            {submitLabel}
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
