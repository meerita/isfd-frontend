/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetitionPyramid } from '@/_actions/competitionStructure/createCompetitionPyramid';
import { updateCompetitionPyramid } from '@/_actions/competitionStructure/updateCompetitionPyramid';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Title from '@/_components/typography/Title';
import {
  COMPETITION_SCOPE_KINDS,
  getCompetitionScopeKindLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type {
  CompetitionPyramid,
  CompetitionPyramidActionState,
} from '@/_types/competitionStructure';
import { formatDateTime } from '../../../_components/utils';

const INITIAL_STATE: CompetitionPyramidActionState = { status: 'idle' };

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

type CompetitionPyramidFormProps = Readonly<{
  competitionPyramid?: CompetitionPyramid | null;
  countries: ReadonlyArray<SelectorOption>;
  federations: ReadonlyArray<SelectorOption>;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

export default function CompetitionPyramidForm({
  competitionPyramid,
  countries,
  federations,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionPyramidFormProps): React.JSX.Element {
  const router = useRouter();
  const [editState, editAction, editPending] = useActionState<
    CompetitionPyramidActionState,
    FormData
  >(updateCompetitionPyramid, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    CompetitionPyramidActionState,
    FormData
  >(createCompetitionPyramid, INITIAL_STATE);

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
        ? 'Competition pyramid updated successfully.'
        : 'Competition pyramid created successfully.',
    );

    if (edit) {
      router.push(
        successHref ?? NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramid?.id ?? ''),
      );
      router.refresh();
      return;
    }

    if (actionState.competitionPyramidId) {
      router.push(
        NAVIGATION.COMPETITION_PYRAMID_BY_ID(actionState.competitionPyramidId),
      );
      router.refresh();
      return;
    }

    router.push(NAVIGATION.COMPETITION_PYRAMIDS);
    router.refresh();
  }, [
    actionState.competitionPyramidId,
    actionState.error,
    actionState.status,
    competitionPyramid?.id,
    edit,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }

    router.push(NAVIGATION.COMPETITION_PYRAMIDS);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && competitionPyramid ? (
        <>
          <input
            type='hidden'
            name='competitionPyramidId'
            value={competitionPyramid.id}
          />
          <input
            type='hidden'
            name='original_countryId'
            value={competitionPyramid.countryId}
          />
          <input
            type='hidden'
            name='original_federationId'
            value={competitionPyramid.federationId ?? ''}
          />
          <input type='hidden' name='original_code' value={competitionPyramid.code} />
          <input type='hidden' name='original_name' value={competitionPyramid.name} />
          <input
            type='hidden'
            name='original_scopeKind'
            value={competitionPyramid.scopeKind}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={competitionPyramid.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition pyramid configuration' : 'Create competition pyramid'}
          </Title>
          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label='Country'
                name='countryId'
                defaultValue={competitionPyramid?.countryId ?? ''}
                disabled={isPending}
              >
                <option value=''>Select a country</option>
                {countries.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <Select
                label='Federation'
                name='federationId'
                defaultValue={competitionPyramid?.federationId ?? ''}
                disabled={isPending}
              >
                <option value=''>No federation</option>
                {federations.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              <TextInput
                label='Code'
                name='code'
                placeholder='SPAIN_MEN'
                defaultValue={competitionPyramid?.code ?? ''}
                required
                disabled={isPending}
              />
              <TextInput
                label='Name'
                name='name'
                placeholder="Spain Men's Pyramid"
                defaultValue={competitionPyramid?.name ?? ''}
                required
                disabled={isPending}
              />
              <Select
                label='Scope'
                name='scopeKind'
                defaultValue={competitionPyramid?.scopeKind ?? 'MEN'}
                disabled={isPending}
              >
                {COMPETITION_SCOPE_KINDS.map(value => (
                  <option key={value} value={value}>
                    {getCompetitionScopeKindLabel(value)}
                  </option>
                ))}
              </Select>
              <CheckBoxInput
                label='Active'
                name='isActive'
                value='true'
                defaultChecked={competitionPyramid?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && competitionPyramid ? (
              <Section gap={16}>
                <TextInput
                  label='ID'
                  defaultValue={competitionPyramid.id}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Slug'
                  defaultValue={competitionPyramid.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Created at'
                  defaultValue={formatDateTime(competitionPyramid.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label='Updated at'
                  defaultValue={formatDateTime(competitionPyramid.updatedAt)}
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
                  ? 'Updating competition pyramid...'
                  : 'Creating competition pyramid...'
                : edit
                  ? 'Update competition pyramid'
                  : 'Create competition pyramid'}
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
