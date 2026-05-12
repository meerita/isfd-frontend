/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetitionEdition } from '@/_actions/competitionEdition/createCompetitionEdition';
import { updateCompetitionEdition } from '@/_actions/competitionEdition/updateCompetitionEdition';
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
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import {
  COMPETITION_EDITION_STATUSES,
  getCompetitionEditionStatusLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import type {
  CompetitionEdition,
  CompetitionEditionActionState,
} from '@/_types/competitionEdition';
import { formatDateForInput, formatDateTime } from '../../_components/utils';

const INITIAL_STATE: CompetitionEditionActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionEditionFormProps = Readonly<{
  competitionEdition?: CompetitionEdition | null;
  competitions: ReadonlyArray<SelectorOption>;
  competitionPyramids: ReadonlyArray<SelectorOption>;
  competitionTiers: ReadonlyArray<SelectorOption>;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function CompetitionEditionForm({
  competitionEdition,
  competitions,
  competitionPyramids,
  competitionTiers,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionEditionFormProps): React.JSX.Element {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    CompetitionEditionActionState,
    FormData
  >(updateCompetitionEdition, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CompetitionEditionActionState,
    FormData
  >(createCompetitionEdition, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    logCompetitionDebug('CompetitionEditionForm', 'actionState', {
      mode: edit ? 'edit' : 'create',
      status: actionState.status,
      error: actionState.error,
      competitionEditionId: actionState.competitionEditionId,
      competitionEditionSlug: actionState.competitionEditionSlug,
    });

    if (actionState.status === 'error') {
      toast.error(resolveCompetitionAdminErrorMessage(actionState.error));
      return;
    }

    toast.success(
      edit
        ? 'Competition edition updated successfully.'
        : 'Competition edition created successfully.',
    );

    if (edit) {
      router.push(
        successHref ??
          NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEdition?.id ?? ''),
      );
      router.refresh();
      return;
    }

    if (actionState.competitionEditionId) {
      router.push(
        NAVIGATION.COMPETITION_EDITION_BY_ID(actionState.competitionEditionId),
      );
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITION_EDITIONS);
    router.refresh();
  }, [
    actionState.competitionEditionId,
    actionState.competitionEditionSlug,
    actionState.error,
    actionState.status,
    competitionEdition?.id,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITION_EDITIONS);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && competitionEdition ? (
        <>
          <input
            type='hidden'
            name='competitionEditionId'
            value={competitionEdition.id}
          />
          <input
            type='hidden'
            name='original_competitionId'
            value={competitionEdition.competitionId}
          />
          <input
            type='hidden'
            name='original_competitionPyramidId'
            value={competitionEdition.competitionPyramidId ?? ''}
          />
          <input
            type='hidden'
            name='original_primaryCompetitionTierId'
            value={competitionEdition.primaryCompetitionTierId ?? ''}
          />
          <input
            type='hidden'
            name='original_editionLabel'
            value={competitionEdition.editionLabel ?? ''}
          />
          <input
            type='hidden'
            name='original_shortName'
            value={competitionEdition.shortName ?? ''}
          />
          <input
            type='hidden'
            name='original_year'
            value={competitionEdition.year === null ? '' : String(competitionEdition.year)}
          />
          <input
            type='hidden'
            name='original_startedOn'
            value={competitionEdition.startedOn ?? ''}
          />
          <input
            type='hidden'
            name='original_endedOn'
            value={competitionEdition.endedOn ?? ''}
          />
          <input
            type='hidden'
            name='original_editorialStatus'
            value={competitionEdition.editorialStatus}
          />
          <input
            type='hidden'
            name='original_sortOrder'
            value={String(competitionEdition.sortOrder)}
          />
          <input
            type='hidden'
            name='original_isPublic'
            value={competitionEdition.isPublic ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition edition configuration' : 'Create competition edition'}
          </Title>

          <Text size='small' color='gray'>
            Competition editions carry time-bound structure and editorial state. Public
            visibility is managed separately from editorial status.
          </Text>

          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label='Competition'
                name='competitionId'
                defaultValue={competitionEdition?.competitionId ?? ''}
                disabled={isPending}
                required
              >
                <option value=''>Select a competition</option>
                {competitions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>

              <TextInput
                label='Edition label'
                name='editionLabel'
                placeholder='2025/26'
                defaultValue={competitionEdition?.editionLabel ?? ''}
                required
                disabled={isPending}
              />

              <Select
                label='Competition pyramid'
                name='competitionPyramidId'
                defaultValue={competitionEdition?.competitionPyramidId ?? ''}
                disabled={isPending}
              >
                <option value=''>No competition pyramid</option>
                {competitionPyramids.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>

              <Select
                label='Primary competition tier'
                name='primaryCompetitionTierId'
                defaultValue={competitionEdition?.primaryCompetitionTierId ?? ''}
                disabled={isPending}
              >
                <option value=''>No primary competition tier</option>
                {competitionTiers.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>

              {edit ? (
                <>
                  <TextInput
                    label='Short name'
                    name='shortName'
                    defaultValue={competitionEdition?.shortName ?? ''}
                    disabled={isPending}
                  />

                  <NumberInput
                    label='Year'
                    name='year'
                    type='number'
                    min='0'
                    defaultValue={
                      competitionEdition?.year === null ||
                      typeof competitionEdition?.year === 'undefined'
                        ? ''
                        : String(competitionEdition.year)
                    }
                    disabled={isPending}
                  />

                  <TextInput
                    label='Started on'
                    name='startedOn'
                    type='date'
                    defaultValue={formatDateForInput(competitionEdition?.startedOn)}
                    disabled={isPending}
                  />

                  <TextInput
                    label='Ended on'
                    name='endedOn'
                    type='date'
                    defaultValue={formatDateForInput(competitionEdition?.endedOn)}
                    disabled={isPending}
                  />

                  <Select
                    label='Editorial status'
                    name='editorialStatus'
                    defaultValue={competitionEdition?.editorialStatus ?? 'DRAFT'}
                    disabled={isPending}
                  >
                    {COMPETITION_EDITION_STATUSES.map(status => (
                      <option key={status} value={status}>
                        {getCompetitionEditionStatusLabel(status)}
                      </option>
                    ))}
                  </Select>

                  <NumberInput
                    label='Sort order'
                    name='sortOrder'
                    type='number'
                    min='0'
                    defaultValue={String(competitionEdition?.sortOrder ?? 0)}
                    disabled={isPending}
                  />

                  <CheckBoxInput
                    key={competitionEdition?.isPublic ? 'edition-public' : 'edition-private'}
                    label='Public visibility'
                    name='isPublic'
                    value='true'
                    defaultChecked={competitionEdition?.isPublic ?? true}
                    disabled={isPending}
                  />
                </>
              ) : (
                <CheckBoxInput
                  label='Public visibility'
                  name='isPublic'
                  value='true'
                  defaultChecked
                  disabled
                />
              )}
            </Section>

            {edit && competitionEdition ? (
              <Section gap={16}>
                <TextInput label='ID' defaultValue={competitionEdition.id} readOnly disabled />
                <TextInput
                  label='Name'
                  defaultValue={competitionEdition.name}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Code'
                  defaultValue={competitionEdition.code ?? ''}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Slug'
                  defaultValue={competitionEdition.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(competitionEdition.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(competitionEdition.updatedAt)}
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
                  ? 'Updating competition edition...'
                  : 'Creating competition edition...'
                : edit
                  ? 'Update competition edition'
                  : 'Create competition edition'}
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
