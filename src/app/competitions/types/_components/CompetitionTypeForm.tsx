/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetitionType } from '@/_actions/competitionType/createCompetitionType';
import { updateCompetitionType } from '@/_actions/competitionType/updateCompetitionType';
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
import {
  COMPETITION_TYPE_CATEGORIES,
  PARTICIPANT_SCOPES,
  getCompetitionTypeCategoryLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type {
  CompetitionType,
  CompetitionTypeActionState,
} from '@/_types/competitionType';
import { formatDateTime } from '../../_components/utils';

const INITIAL_STATE: CompetitionTypeActionState = { status: 'idle' };

type CompetitionTypeFormProps = Readonly<{
  competitionType?: CompetitionType | null;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function CompetitionTypeForm({
  competitionType,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionTypeFormProps): React.JSX.Element {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    CompetitionTypeActionState,
    FormData
  >(updateCompetitionType, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CompetitionTypeActionState,
    FormData
  >(createCompetitionType, INITIAL_STATE);

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
      edit
        ? 'Competition type updated successfully.'
        : 'Competition type created successfully.',
    );

    if (edit) {
      router.push(
        successHref ?? NAVIGATION.COMPETITION_TYPE_BY_ID(competitionType?.id ?? ''),
      );
      router.refresh();
      return;
    }

    if (actionState.competitionTypeId) {
      router.push(NAVIGATION.COMPETITION_TYPE_BY_ID(actionState.competitionTypeId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITION_TYPES);
    router.refresh();
  }, [
    actionState.competitionTypeId,
    actionState.error,
    actionState.status,
    competitionType?.id,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITION_TYPES);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && competitionType ? (
        <>
          <input
            type='hidden'
            name='competitionTypeId'
            value={competitionType.id}
          />
          <input type='hidden' name='original_name' value={competitionType.name} />
          <input
            type='hidden'
            name='original_competitionTypeCategory'
            value={competitionType.competitionTypeCategory}
          />
          <input
            type='hidden'
            name='original_participantScope'
            value={competitionType.participantScope}
          />
          <input
            type='hidden'
            name='original_sortOrder'
            value={String(competitionType.sortOrder)}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={competitionType.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition type configuration' : 'Create competition type'}
          </Title>
          <Grid gap={16} columns={2}>
            <Section gap={16}>
              {!edit ? (
                <TextInput
                  label='Code'
                  name='code'
                  placeholder='UEFA_CLUB'
                  defaultValue={competitionType?.code ?? ''}
                  required
                  disabled={isPending}
                />
              ) : (
                <TextInput
                  label='Code'
                  defaultValue={competitionType?.code ?? ''}
                  readOnly
                  disabled
                />
              )}
              <TextInput
                label='Name'
                name='name'
                placeholder='UEFA club competition'
                defaultValue={competitionType?.name ?? ''}
                required
                disabled={isPending}
              />
              <Select
                label='Competition type category'
                name='competitionTypeCategory'
                defaultValue={competitionType?.competitionTypeCategory ?? 'LEAGUE'}
                disabled={isPending}
              >
                {COMPETITION_TYPE_CATEGORIES.map(value => (
                  <option key={value} value={value}>
                    {getCompetitionTypeCategoryLabel(value)}
                  </option>
                ))}
              </Select>
              <Select
                label='Participant scope'
                name='participantScope'
                defaultValue={competitionType?.participantScope ?? 'CLUB'}
                disabled={isPending}
              >
                {PARTICIPANT_SCOPES.map(value => (
                  <option key={value} value={value}>
                    {getParticipantScopeLabel(value)}
                  </option>
                ))}
              </Select>
              <NumberInput
                label='Sort order'
                name='sortOrder'
                type='number'
                min='0'
                defaultValue={String(competitionType?.sortOrder ?? 0)}
                disabled={isPending}
              />
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={competitionType?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && competitionType ? (
              <Section gap={16}>
                <TextInput
                  label='ID'
                  defaultValue={competitionType.id}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Slug'
                  defaultValue={competitionType.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(competitionType.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(competitionType.updatedAt)}
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
                  ? 'Updating competition type...'
                  : 'Creating competition type...'
                : edit
                  ? 'Update competition type'
                  : 'Create competition type'}
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
