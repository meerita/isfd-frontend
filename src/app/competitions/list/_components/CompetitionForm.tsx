/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetition } from '@/_actions/competition/createCompetition';
import { updateCompetition } from '@/_actions/competition/updateCompetition';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
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
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type { Competition, CompetitionActionState } from '@/_types/competition';
import {
  formatDateForInput,
  formatDateTime,
} from '../../_components/utils';

const INITIAL_STATE: CompetitionActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionFormProps = Readonly<{
  competition?: Competition | null;
  competitionTypes: ReadonlyArray<SelectorOption>;
  federations: ReadonlyArray<SelectorOption>;
  countries: ReadonlyArray<SelectorOption>;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function CompetitionForm({
  competition,
  competitionTypes,
  federations,
  countries,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionFormProps): React.JSX.Element {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    CompetitionActionState,
    FormData
  >(updateCompetition, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CompetitionActionState,
    FormData
  >(createCompetition, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveCompetitionAdminErrorMessage(actionState.error));
      return;
    }

    toast.success(
      edit ? 'Competition updated successfully.' : 'Competition created successfully.',
    );

    if (edit) {
      router.push(successHref ?? NAVIGATION.COMPETITION_BY_ID(competition?.id ?? ''));
      router.refresh();
      return;
    }

    if (actionState.competitionId) {
      router.push(NAVIGATION.COMPETITION_BY_ID(actionState.competitionId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITIONS_LIST);
    router.refresh();
  }, [
    actionState.competitionId,
    actionState.error,
    actionState.status,
    competition?.id,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITIONS_LIST);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && competition ? (
        <>
          <input type='hidden' name='competitionId' value={competition.id} />
          <input
            type='hidden'
            name='original_competitionTypeId'
            value={competition.competitionTypeId}
          />
          <input type='hidden' name='original_code' value={competition.code} />
          <input type='hidden' name='original_name' value={competition.name} />
          <input
            type='hidden'
            name='original_federationId'
            value={competition.federationId ?? ''}
          />
          <input
            type='hidden'
            name='original_countryId'
            value={competition.countryId ?? ''}
          />
          <input
            type='hidden'
            name='original_startedOn'
            value={competition.startedOn ?? ''}
          />
          <input
            type='hidden'
            name='original_endedOn'
            value={competition.endedOn ?? ''}
          />
          <input
            type='hidden'
            name='original_sortOrder'
            value={String(competition.sortOrder)}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={competition.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition configuration' : 'Create competition'}
          </Title>
          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label='Competition type'
                name='competitionTypeId'
                defaultValue={competition?.competitionTypeId ?? ''}
                disabled={isPending}
              >
                <option value=''>Select a competition type</option>
                {competitionTypes.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Select
                label='Federation'
                name='federationId'
                defaultValue={competition?.federationId ?? ''}
                disabled={isPending}
              >
                <option value=''>No federation</option>
                {federations.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Select
                label='Country'
                name='countryId'
                defaultValue={competition?.countryId ?? ''}
                disabled={isPending}
              >
                <option value=''>No country</option>
                {countries.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <TextInput
                label='Code'
                name='code'
                placeholder='UEFA_CHAMPIONS_LEAGUE'
                defaultValue={competition?.code ?? ''}
                required
                disabled={isPending}
              />
              <TextInput
                label='Name'
                name='name'
                placeholder='UEFA Champions League'
                defaultValue={competition?.name ?? ''}
                required
                disabled={isPending}
              />
              <TextInput
                label='Started on'
                name='startedOn'
                type='date'
                defaultValue={formatDateForInput(competition?.startedOn)}
                disabled={isPending}
              />
              <TextInput
                label='Ended on'
                name='endedOn'
                type='date'
                defaultValue={formatDateForInput(competition?.endedOn)}
                disabled={isPending}
              />
              <NumberInput
                label='Sort order'
                name='sortOrder'
                type='number'
                min='0'
                defaultValue={String(competition?.sortOrder ?? 0)}
                disabled={isPending}
              />
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={competition?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && competition ? (
              <Section gap={16}>
                <TextInput label='ID' defaultValue={competition.id} readOnly disabled />
                <TextInput
                  label='Slug'
                  defaultValue={competition.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(competition.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(competition.updatedAt)}
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
                  ? 'Updating competition...'
                  : 'Creating competition...'
                : edit
                  ? 'Update competition'
                  : 'Create competition'}
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
