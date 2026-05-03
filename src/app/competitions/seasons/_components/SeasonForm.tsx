/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createSeason } from '@/_actions/season/createSeason';
import { updateSeason } from '@/_actions/season/updateSeason';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import NumberInput from '@/_components/forms/NumberInput';
import TextInput from '@/_components/forms/TextInput';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import type { Season, SeasonActionState } from '@/_types/season';
import { formatDateTime } from '../../_components/utils';

const INITIAL_STATE: SeasonActionState = { status: 'idle' };

type SeasonFormProps = Readonly<{
  season?: Season | null;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function SeasonForm({
  season,
  edit = false,
  cancelHref,
  successHref,
}: SeasonFormProps): React.JSX.Element {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    SeasonActionState,
    FormData
  >(updateSeason, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    SeasonActionState,
    FormData
  >(createSeason, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    logCompetitionDebug('SeasonForm', 'actionState', {
      mode: edit ? 'edit' : 'create',
      status: actionState.status,
      error: actionState.error,
      seasonId: actionState.seasonId,
    });

    if (actionState.status === 'error') {
      toast.error(resolveCompetitionAdminErrorMessage(actionState.error));
      return;
    }

    toast.success(edit ? 'Season updated successfully.' : 'Season created successfully.');

    if (edit) {
      router.push(successHref ?? NAVIGATION.SEASON_BY_ID(season?.id ?? ''));
      router.refresh();
      return;
    }

    if (actionState.seasonId) {
      router.push(NAVIGATION.SEASON_BY_ID(actionState.seasonId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITION_SEASONS);
    router.refresh();
  }, [
    actionState.error,
    actionState.seasonId,
    actionState.status,
    edit,
    router,
    season?.id,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITION_SEASONS);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && season ? (
        <>
          <input type='hidden' name='seasonId' value={season.id} />
          <input type='hidden' name='original_name' value={season.name} />
          <input
            type='hidden'
            name='original_startYear'
            value={String(season.startYear)}
          />
          <input
            type='hidden'
            name='original_endYear'
            value={season.endYear === null ? '' : String(season.endYear)}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={season.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>{edit ? 'Season configuration' : 'Create season'}</Title>
          <Grid gap={16} columns={2}>
            <Section gap={16}>
              {!edit ? (
                <TextInput
                  label='Code'
                  name='code'
                  placeholder='SEASON_2025'
                  defaultValue={season?.code ?? ''}
                  required
                  disabled={isPending}
                />
              ) : (
                <TextInput
                  label='Code'
                  defaultValue={season?.code ?? ''}
                  readOnly
                  disabled
                />
              )}
              <TextInput
                label='Name'
                name='name'
                placeholder='2025 / 2026'
                defaultValue={season?.name ?? ''}
                required
                disabled={isPending}
              />
              <NumberInput
                label='Start year'
                name='startYear'
                type='number'
                min='1'
                defaultValue={String(season?.startYear ?? '')}
                required
                disabled={isPending}
              />
              <NumberInput
                label='End year'
                name='endYear'
                type='number'
                min='1'
                defaultValue={season?.endYear === null ? '' : String(season?.endYear)}
                disabled={isPending}
              />
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={season?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && season ? (
              <Section gap={16}>
                <TextInput label='ID' defaultValue={season.id} readOnly disabled />
                <TextInput label='Slug' defaultValue={season.slug} readOnly disabled />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(season.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(season.updatedAt)}
                  readOnly
                  disabled
                />
              </Section>
            ) : null}
          </Grid>

          <ButtonGroup gap={4}>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending
                ? edit
                  ? 'Updating season...'
                  : 'Creating season...'
                : edit
                  ? 'Update season'
                  : 'Create season'}
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
