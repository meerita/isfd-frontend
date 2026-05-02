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

import { createCompetitionTier } from '@/_actions/competitionStructure/createCompetitionTier';
import { updateCompetitionTier } from '@/_actions/competitionStructure/updateCompetitionTier';
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
  COMPETITION_SCOPE_KINDS,
  PARTICIPANT_SCOPES,
  getCompetitionScopeKindLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type {
  CompetitionTier,
  CompetitionTierActionState,
} from '@/_types/competitionStructure';
import { formatDateTime } from '../../../_components/utils';

const INITIAL_STATE: CompetitionTierActionState = { status: 'idle' };

type CompetitionTierOption = Readonly<{
  id: string;
  competitionPyramidId: string;
  name: string;
}>;

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionTierFormProps = Readonly<{
  competitionTier?: CompetitionTier | null;
  competitionPyramids: ReadonlyArray<SelectorOption>;
  competitionTiers: ReadonlyArray<CompetitionTierOption>;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function CompetitionTierForm({
  competitionTier,
  competitionPyramids,
  competitionTiers,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionTierFormProps): React.JSX.Element {
  const router = useRouter();
  const [selectedPyramidId, setSelectedPyramidId] = useState(
    competitionTier?.competitionPyramidId ?? '',
  );
  const [selectedParentTierId, setSelectedParentTierId] = useState(
    competitionTier?.parentTierId ?? '',
  );
  const [editState, editAction, editPending] = useActionState<
    CompetitionTierActionState,
    FormData
  >(updateCompetitionTier, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CompetitionTierActionState,
    FormData
  >(createCompetitionTier, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;
  const parentTierOptions = useMemo(
    () =>
      competitionTiers.filter(
        item =>
          item.competitionPyramidId === selectedPyramidId &&
          item.id !== competitionTier?.id,
      ),
    [competitionTier?.id, competitionTiers, selectedPyramidId],
  );

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveCompetitionAdminErrorMessage(actionState.error));
      return;
    }

    toast.success(
      edit
        ? 'Competition tier updated successfully.'
        : 'Competition tier created successfully.',
    );

    if (edit) {
      router.push(successHref ?? NAVIGATION.COMPETITION_TIER_BY_ID(competitionTier?.id ?? ''));
      router.refresh();
      return;
    }

    if (actionState.competitionTierId) {
      router.push(NAVIGATION.COMPETITION_TIER_BY_ID(actionState.competitionTierId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITION_TIERS);
    router.refresh();
  }, [
    actionState.competitionTierId,
    actionState.error,
    actionState.status,
    competitionTier?.id,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITION_TIERS);
  }, [cancelHref, router]);

  const handlePyramidChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPyramidId(event.target.value);
    setSelectedParentTierId('');
  }, []);

  return (
    <Form action={formAction}>
      {edit && competitionTier ? (
        <>
          <input type='hidden' name='competitionTierId' value={competitionTier.id} />
          <input
            type='hidden'
            name='original_competitionPyramidId'
            value={competitionTier.competitionPyramidId}
          />
          <input
            type='hidden'
            name='original_parentTierId'
            value={competitionTier.parentTierId ?? ''}
          />
          <input type='hidden' name='original_code' value={competitionTier.code} />
          <input type='hidden' name='original_name' value={competitionTier.name} />
          <input
            type='hidden'
            name='original_shortName'
            value={competitionTier.shortName ?? ''}
          />
          <input
            type='hidden'
            name='original_levelOrder'
            value={competitionTier.levelOrder === null ? '' : String(competitionTier.levelOrder)}
          />
          <input
            type='hidden'
            name='original_scopeKind'
            value={competitionTier.scopeKind}
          />
          <input
            type='hidden'
            name='original_participantScope'
            value={competitionTier.participantScope}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={competitionTier.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition tier configuration' : 'Create competition tier'}
          </Title>
          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label='Competition pyramid'
                name='competitionPyramidId'
                value={selectedPyramidId}
                onChange={handlePyramidChange}
                disabled={isPending}
              >
                <option value=''>Select a competition pyramid</option>
                {competitionPyramids.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Select
                label='Parent tier'
                name='parentTierId'
                value={selectedParentTierId}
                onChange={event => setSelectedParentTierId(event.target.value)}
                disabled={isPending || !selectedPyramidId}
              >
                <option value=''>No parent tier</option>
                {parentTierOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <TextInput
                label='Code'
                name='code'
                placeholder='TIER_1'
                defaultValue={competitionTier?.code ?? ''}
                required
                disabled={isPending}
              />
              <TextInput
                label='Name'
                name='name'
                placeholder='Primera Division'
                defaultValue={competitionTier?.name ?? ''}
                required
                disabled={isPending}
              />
              <TextInput
                label='Short name'
                name='shortName'
                defaultValue={competitionTier?.shortName ?? ''}
                disabled={isPending}
              />
              <NumberInput
                label='Level order'
                name='levelOrder'
                type='number'
                min='0'
                defaultValue={
                  competitionTier?.levelOrder === null
                    ? ''
                    : String(competitionTier?.levelOrder)
                }
                disabled={isPending}
              />
              <Select
                label='Scope'
                name='scopeKind'
                defaultValue={competitionTier?.scopeKind ?? 'MEN'}
                disabled={isPending}
              >
                {COMPETITION_SCOPE_KINDS.map(value => (
                  <option key={value} value={value}>
                    {getCompetitionScopeKindLabel(value)}
                  </option>
                ))}
              </Select>
              <Select
                label='Participant scope'
                name='participantScope'
                defaultValue={competitionTier?.participantScope ?? 'CLUB'}
                disabled={isPending}
              >
                {PARTICIPANT_SCOPES.map(value => (
                  <option key={value} value={value}>
                    {getParticipantScopeLabel(value)}
                  </option>
                ))}
              </Select>
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={competitionTier?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && competitionTier ? (
              <Section gap={16}>
                <TextInput label='ID' defaultValue={competitionTier.id} readOnly disabled />
                <TextInput
                  label='Slug'
                  defaultValue={competitionTier.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(competitionTier.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(competitionTier.updatedAt)}
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
                  ? 'Updating competition tier...'
                  : 'Creating competition tier...'
                : edit
                  ? 'Update competition tier'
                  : 'Create competition tier'}
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
