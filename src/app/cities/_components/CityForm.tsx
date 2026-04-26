/** @format */

'use client';
// File: src/app/cities/_components/CityForm.tsx
// Purpose: Form component to create or edit cities

import { useActionState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import NAVIGATION from '@/_constants/navigation';
import { createCity } from '@/_actions/city/createCity';
import { updateCity } from '@/_actions/city/updateCity';
import type { City, CityActionState } from '@/_types/city';
import type { Country } from '@/_types/country';

const INITIAL_ACTION_STATE: CityActionState = { status: 'idle' };

function toStringValue(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toString() : '';
}

type CountryOption = Readonly<Pick<Country, 'id' | 'name'>>;

type CityFormProps = Readonly<{
  city?: City | null;
  countries: ReadonlyArray<CountryOption>;
  edit?: boolean;
  initialCountryId?: string | null;
}>;

export default function CityForm({
  city,
  countries,
  edit = false,
  initialCountryId = null,
}: CityFormProps) {
  const router = useRouter();

  const [editState, editAction, editPending] = useActionState<CityActionState, FormData>(
    updateCity,
    INITIAL_ACTION_STATE,
  );
  const [createState, createAction, createPending] = useActionState<CityActionState, FormData>(
    createCity,
    INITIAL_ACTION_STATE,
  );

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const pending = edit ? editPending : createPending;

  const defaultCountryId = city?.countryId ?? initialCountryId ?? '';
  const hasCountryOptions = countries.length > 0;

  const handleCancel = useCallback(
    function handleCancel() {
      if (globalThis?.window?.history.length > 1) {
        router.back();
        return;
      }
      router.push(NAVIGATION.CITIES);
    },
    [router],
  );

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error' && actionState.error) {
      const errorMessage =
        actionState.error.error ||
        actionState.error.message ||
        'We could not save the city.';
      toast.error(errorMessage);
      return;
    }

    if (actionState.status === 'success') {
      if (edit) {
        toast.success('City updated successfully.');
        return;
      }
      toast.success('City created successfully.');
      handleCancel();
    }
  }, [actionState.error, actionState.status, edit, handleCancel]);

  const countryIsFixed = !edit && Boolean(initialCountryId);
  const isSubmitDisabled = pending || (!countryIsFixed && !hasCountryOptions);

  return (
    <Form action={formAction}>
      {edit && city ? (
        <input type='hidden' name='cityId' value={city.id} />
      ) : null}

      <Section>
        <Grid gap={8} columns={edit ? 2 : 1}>
          {!edit && initialCountryId ? (
            <input type='hidden' name='countryId' value={initialCountryId} />
          ) : (
            <Select
              label='Country'
              name='countryId'
              defaultValue={defaultCountryId}
              placeholder='Select a country'
              required
              disabled={pending || !hasCountryOptions}
            >
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </Select>
          )}
          <TextInput
            label='City name'
            name='name'
            placeholder='Enter city name'
            defaultValue={city?.name ?? ''}
            required
            disabled={pending}
          />
          {edit ? (
            <>
              <TextInput
                label='Region'
                name='regionName'
                placeholder='Enter region (optional)'
                defaultValue={city?.regionName ?? ''}
                disabled={pending}
              />
              <TextInput
                label='Province'
                name='provinceName'
                placeholder='Enter province (optional)'
                defaultValue={city?.provinceName ?? ''}
                disabled={pending}
              />
              <TextInput
                label='Latitude'
                name='latitude'
                placeholder='-34.6118'
                defaultValue={toStringValue(city?.latitude)}
                inputMode='decimal'
                pattern='-?[0-9]*[.,]?[0-9]*'
                disabled={pending}
              />
              <TextInput
                label='Longitude'
                name='longitude'
                placeholder='-58.3886'
                defaultValue={toStringValue(city?.longitude)}
                inputMode='decimal'
                pattern='-?[0-9]*[.,]?[0-9]*'
                disabled={pending}
              />
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={city?.isActive ?? false}
                disabled={pending}
              />
            </>
          ) : null}
        </Grid>

        {edit && city ? (
          <Grid gap={8} columns={2} className='margin-top--16'>
            <TextInput
              label='ID'
              defaultValue={city.id}
              readOnly
              disabled
            />
            <TextInput
              label='Slug'
              defaultValue={city.slug}
              readOnly
              disabled
            />
            <TextInput
              label='Translation key'
              defaultValue={city.translationKey}
              readOnly
              disabled
              className='grid-column--2'
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4} className='margin-top--24'>
          <Button
            type='submit'
            disabled={isSubmitDisabled}
            aria-busy={pending}
          >
            {pending
              ? edit
                ? 'Updating city...'
                : 'Creating city...'
              : edit
                ? 'Update city'
                : 'Create city'}
          </Button>
          <Button
            type='button'
            onClick={handleCancel}
            variant='borderless'
            kind='primary'
            disabled={pending}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Section>
    </Form>
  );
}
