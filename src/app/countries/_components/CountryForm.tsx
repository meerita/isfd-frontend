/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCountry } from '@/_actions/country/createCountry';
import { updateCountry } from '@/_actions/country/updateCountry';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import CONTINENTS from '@/_constants/continents';
import { resolveCountryErrorMessage } from '@/_constants/countryErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import type { Country, CountryActionState } from '@/_types/country';

const INITIAL_STATE: CountryActionState = { status: 'idle' };

type CountryFormProps = Readonly<{
  country?: Country | null;
  edit?: boolean;
}>;

export default function CountryForm({
  country,
  edit = false,
}: CountryFormProps) {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    CountryActionState,
    FormData
  >(updateCountry, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CountryActionState,
    FormData
  >(createCountry, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveCountryErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Country updated successfully.');
      router.refresh();
      return;
    }

    toast.success('Country created successfully.');
    if (actionState.countryId) {
      router.push(NAVIGATION.COUNTRY_BY_ID(actionState.countryId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COUNTRIES);
    router.refresh();
  }, [actionState.countryId, actionState.error, actionState.status, edit, router]);

  const handleCancel = useCallback(() => {
    if (
      globalThis.window?.history.length &&
      globalThis.window.history.length > 1
    ) {
      router.back();
      return;
    }

    router.push(NAVIGATION.COUNTRIES);
  }, [router]);

  return (
    <Form action={formAction}>
      {edit && country ? (
        <>
          <input type='hidden' name='countryId' value={country.id} />
          <input type='hidden' name='original_name' value={country.name} />
          <input
            type='hidden'
            name='original_iso2Code'
            value={country.iso2Code ?? ''}
          />
          <input
            type='hidden'
            name='original_iso3Code'
            value={country.iso3Code ?? ''}
          />
          <input
            type='hidden'
            name='original_continentCode'
            value={country.continentCode ?? ''}
          />
          <input
            type='hidden'
            name='original_flagImageUrl'
            value={country.flagImageUrl ?? ''}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={country.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Section>
        <Grid gap={8} columns={edit ? 3 : 1}>
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
                placeholder='ES'
                maxLength={2}
                defaultValue={country?.iso2Code ?? ''}
                disabled={isPending}
              />
              <TextInput
                label='ISO 3 code'
                name='iso3Code'
                placeholder='ESP'
                maxLength={3}
                defaultValue={country?.iso3Code ?? ''}
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
              {CONTINENTS.map(continent => (
                <option key={continent.value} value={continent.value}>
                  {continent.label}
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
            <CheckBoxInput
              label='Active'
              name='isActive'
              value='true'
              defaultChecked={country?.isActive ?? false}
              disabled={isPending}
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4}>
          <Button type='submit' disabled={isPending} aria-busy={isPending}>
            {isPending
              ? edit
                ? 'Updating...'
                : 'Creating...'
              : edit
                ? 'Update country'
                : 'Create country'}
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
