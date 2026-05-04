/** @format */

'use client';

import { useActionState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetitionPyramid } from '@/_actions/competitionStructure/createCompetitionPyramid';
import { updateCompetitionPyramid } from '@/_actions/competitionStructure/updateCompetitionPyramid';
import Card from '@/_components/Card';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import {
  COMPETITION_PYRAMID_SCOPE_KINDS,
  COMPETITION_STRUCTURE_BRANCH_KINDS,
  getCompetitionPyramidScopeKindLabel,
  getCompetitionStructureBranchKindLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { useI18n } from '@/_i18n/I18nProvider';
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
  const { dictionary, locale } = useI18n();
  const formDictionary = dictionary.competitions.pyramids.form;
  const fieldDictionary = dictionary.competitions.pyramids.fields;
  const currentCompetitionPyramid = competitionPyramid ?? null;
  const submitCompetitionPyramid = edit
    ? updateCompetitionPyramid
    : createCompetitionPyramid;
  const [actionState, formAction, isPending] = useActionState<
    CompetitionPyramidActionState,
    FormData
  >(submitCompetitionPyramid, INITIAL_STATE);
  const errorMessage =
    actionState.status === 'error'
      ? resolveCompetitionAdminErrorMessage(
          actionState.error,
          dictionary.common.unexpectedError,
        )
      : null;

  useEffect(() => {
    if (actionState.status === 'idle') return;

    logCompetitionDebug('CompetitionPyramidForm', 'actionState', {
      mode: edit ? 'edit' : 'create',
      status: actionState.status,
      error: actionState.error,
      competitionPyramidId: actionState.competitionPyramidId,
    });

    if (actionState.status === 'error') {
      toast.error(errorMessage ?? dictionary.common.unexpectedError);
      return;
    }

    toast.success(
      edit ? formDictionary.successUpdate : formDictionary.successCreate,
    );

    if (edit) {
      router.push(
        successHref ??
          NAVIGATION.COMPETITION_PYRAMID_BY_ID(currentCompetitionPyramid?.id ?? ''),
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
    currentCompetitionPyramid?.id,
    dictionary.common.unexpectedError,
    edit,
    errorMessage,
    formDictionary.successCreate,
    formDictionary.successUpdate,
    router,
    successHref,
  ]);

  const handleCancel = useCallback(() => {
    router.push(cancelHref ?? NAVIGATION.COMPETITION_PYRAMIDS);
  }, [cancelHref, router]);

  return (
    <Form action={formAction}>
      {edit && currentCompetitionPyramid ? (
        <>
          <input
            type='hidden'
            name='competitionPyramidId'
            value={currentCompetitionPyramid.id}
          />
          <input
            type='hidden'
            name='original_countryId'
            value={currentCompetitionPyramid.countryId}
          />
          <input
            type='hidden'
            name='original_federationId'
            value={currentCompetitionPyramid.federationId ?? ''}
          />
          <input
            type='hidden'
            name='original_code'
            value={currentCompetitionPyramid.code}
          />
          <input
            type='hidden'
            name='original_name'
            value={currentCompetitionPyramid.name}
          />
          <input
            type='hidden'
            name='original_scopeKind'
            value={currentCompetitionPyramid.scopeKind}
          />
          <input
            type='hidden'
            name='original_branchKind'
            value={currentCompetitionPyramid.branchKind ?? ''}
          />
          <input
            type='hidden'
            name='original_validFrom'
            value={currentCompetitionPyramid.validFrom}
          />
          <input
            type='hidden'
            name='original_validTo'
            value={currentCompetitionPyramid.validTo ?? ''}
          />
          <input
            type='hidden'
            name='original_isActive'
            value={currentCompetitionPyramid.isActive ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? formDictionary.editTitle : formDictionary.createTitle}
          </Title>

          {errorMessage ? (
            <Text color='red' size='small'>
              {errorMessage}
            </Text>
          ) : null}

          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label={fieldDictionary.country}
                name='countryId'
                defaultValue={currentCompetitionPyramid?.countryId ?? ''}
                disabled={isPending}
              >
                <option value=''>{formDictionary.countryPlaceholder}</option>
                {countries.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>

              <Select
                label={fieldDictionary.federation}
                name='federationId'
                defaultValue={currentCompetitionPyramid?.federationId ?? ''}
                disabled={isPending}
              >
                <option value=''>{formDictionary.noFederation}</option>
                {federations.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>

              <TextInput
                label={fieldDictionary.code}
                name='code'
                placeholder='SPAIN_NATIONAL'
                defaultValue={currentCompetitionPyramid?.code ?? ''}
                required
                disabled={isPending}
              />

              <TextInput
                label={fieldDictionary.name}
                name='name'
                placeholder='Spain National Pyramid'
                defaultValue={currentCompetitionPyramid?.name ?? ''}
                required
                disabled={isPending}
              />

              <Select
                label={fieldDictionary.scope}
                name='scopeKind'
                defaultValue={currentCompetitionPyramid?.scopeKind ?? 'NATIONAL'}
                disabled={isPending}
              >
                {COMPETITION_PYRAMID_SCOPE_KINDS.map(value => (
                  <option key={value} value={value}>
                    {getCompetitionPyramidScopeKindLabel(value, locale)}
                  </option>
                ))}
              </Select>

              <Select
                label={fieldDictionary.branch}
                name='branchKind'
                defaultValue={currentCompetitionPyramid?.branchKind ?? ''}
                disabled={isPending}
                required
              >
                <option value=''>{formDictionary.branchPlaceholder}</option>
                {COMPETITION_STRUCTURE_BRANCH_KINDS.map(value => (
                  <option key={value} value={value}>
                    {getCompetitionStructureBranchKindLabel(value, locale)}
                  </option>
                ))}
              </Select>

              <TextInput
                label={fieldDictionary.validFrom}
                type='date'
                name='validFrom'
                defaultValue={currentCompetitionPyramid?.validFrom ?? ''}
                required
                disabled={isPending}
              />

              {edit ? (
                <TextInput
                  label={fieldDictionary.validTo}
                  type='date'
                  name='validTo'
                  defaultValue={currentCompetitionPyramid?.validTo ?? ''}
                  disabled={isPending}
                />
              ) : null}

              <CheckBoxInput
                label={fieldDictionary.active}
                name='isActive'
                value='true'
                defaultChecked={currentCompetitionPyramid?.isActive ?? true}
                disabled={isPending}
              />
            </Section>

            {edit && currentCompetitionPyramid ? (
              <Section gap={16}>
                <TextInput
                  label={fieldDictionary.id}
                  defaultValue={currentCompetitionPyramid.id}
                  readOnly
                  disabled
                />
                <TextInput
                  label={fieldDictionary.versionId}
                  defaultValue={currentCompetitionPyramid.versionId ?? ''}
                  readOnly
                  disabled
                />
                <TextInput
                  label={fieldDictionary.slug}
                  defaultValue={currentCompetitionPyramid.slug}
                  readOnly
                  disabled
                />
                <TextInput
                  label={fieldDictionary.createdAt}
                  defaultValue={formatDateTime(currentCompetitionPyramid.createdAt)}
                  readOnly
                  disabled
                />
                <TextInput
                  label={fieldDictionary.updatedAt}
                  defaultValue={formatDateTime(currentCompetitionPyramid.updatedAt)}
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
                  ? formDictionary.submitUpdatePending
                  : formDictionary.submitCreatePending
                : edit
                  ? formDictionary.submitUpdate
                  : formDictionary.submitCreate}
            </Button>

            <Button
              type='button'
              onClick={handleCancel}
              disabled={isPending}
              variant='borderless'
            >
              {dictionary.common.cancel}
            </Button>
          </ButtonGroup>
        </Grid>
      </Card>
    </Form>
  );
}
