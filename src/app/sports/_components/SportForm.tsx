/** @format */

'use client';

// File: src/app/sports/_components/SportForm.tsx
// Purpose: Form component to create or edit sports
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createSport } from '@/_actions/sport/createSport';
import { updateSport } from '@/_actions/sport/updateSport';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import LastUpdated from '@/_components/forms/LastUpdated';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import type { Sport, SportActionState } from '@/_types/sport';

const INITIAL_ACTION_STATE: SportActionState = { status: 'idle' };

type SportFormValues = Readonly<{
  name: string;
  localizedName: string;
  iconKey: string;
  image: string;
  visible: boolean;
  popular: boolean;
  active: boolean;
}>;

type SportFormProps = Readonly<{
  sport?: Sport | null;
  edit?: boolean;
}>;

function buildInitialValues(sport?: Sport | null): SportFormValues {
  return {
    name: sport?.name ?? '',
    localizedName: sport?.localizedName ?? '',
    iconKey: sport?.iconKey ?? sport?.icon ?? '',
    image: sport?.image ?? '',
    visible: sport?.visible ?? true,
    popular: sport?.popular ?? false,
    active: (sport?.status ?? 'active') === 'active',
  };
}

export default function SportForm({ sport, edit = false }: SportFormProps) {
  const router = useRouter();
  const initialValues = buildInitialValues(sport);
  const actionHandler = edit ? updateSport : createSport;
  const [actionState, formAction, pending] = useActionState<
    SportActionState,
    FormData
  >(actionHandler, INITIAL_ACTION_STATE);
  const submitLabel = edit ? 'Update sport' : 'Create sport';
  const lastUpdatedTimestamp = sport?.updatedAt ?? sport?.createdAt ?? null;

  const handleCancel = useCallback(
    function handleCancel() {
      if (globalThis?.window?.history.length > 1) {
        router.back();
        return;
      }

      router.push(NAVIGATION.SPORTS);
    },
    [router],
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
          'We could not save the sport.';
        toast.error(errorMessage);
        return;
      }

      if (actionState.status === 'success') {
        if (edit) {
          toast.success('Sport updated successfully.');
          return;
        }

        toast.success('Sport created successfully.');
        handleCancel();
      }
    },
    [actionState.error, actionState.status, edit, handleCancel],
  );

  return (
    <Form action={formAction}>
      {edit && sport ? (
        <input type='hidden' name='sportId' value={sport.id} />
      ) : null}

      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Sport name'
              name='name'
              placeholder='Enter sport name'
              defaultValue={initialValues.name}
              required
              disabled={pending}
            />
            <TextInput
              label='Localized name'
              name='localizedName'
              placeholder='Enter localized name'
              defaultValue={initialValues.localizedName}
              required
              disabled={pending}
            />
            <TextInput
              label='Icon key'
              name='iconKey'
              placeholder='basketball'
              defaultValue={initialValues.iconKey}
              helperText='Optional. Leave empty to derive it from the localized name.'
              disabled={pending}
            />
            <TextInput
              label='Image URL'
              name='image'
              placeholder='https://cdn.example.com/images/sport.png'
              defaultValue={initialValues.image}
              type='url'
              disabled={pending}
            />
          </Grid>

          <Grid gap={8} columns={4}>
            <CheckBoxInput
              name='active'
              label='Active'
              defaultChecked={initialValues.active}
              value='true'
              disabled={pending}
            />
            <CheckBoxInput
              name='visible'
              label='Visible'
              defaultChecked={initialValues.visible}
              value='true'
              disabled={pending}
            />
            <CheckBoxInput
              name='popular'
              label='Popular'
              defaultChecked={initialValues.popular}
              value='true'
              disabled={pending}
            />
          </Grid>

          <ButtonGroup gap={4} className='margin-top--24'>
            <Button type='submit' disabled={pending} aria-busy={pending}>
              {pending
                ? edit
                  ? 'Updating sport...'
                  : 'Creating sport...'
                : submitLabel}
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
