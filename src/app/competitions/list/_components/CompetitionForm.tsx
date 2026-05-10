/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
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
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import type { ApiErrorResponse } from '@/_types/api';
import type { Competition, CompetitionActionState } from '@/_types/competition';
import {
  createCompetitionFormValues,
  ensureOption,
  resolveCompetitionFormFieldErrors,
  resolveCompetitionFormGlobalError,
  type CompetitionFormField,
  type CompetitionSelectOption,
  type CompetitionTypeOption,
  validateCompetitionFormValues,
} from '../_lib/competitionAdmin';
import { formatDateForInput, formatDateTime } from '../../_components/utils';

const INITIAL_STATE: CompetitionActionState = { status: 'idle' };

type CompetitionFormProps = Readonly<{
  competition?: Competition | null;
  competitionTypes: ReadonlyArray<CompetitionTypeOption>;
  federations: ReadonlyArray<CompetitionSelectOption>;
  countries: ReadonlyArray<CompetitionSelectOption>;
  catalogError?: ApiErrorResponse;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

type SelectField = 'competitionTypeId' | 'federationId' | 'countryId';
type TextField = 'name' | 'originalName' | 'startedOn' | 'endedOn' | 'sortOrder';

function getFieldError(
  fieldErrors: Partial<Record<CompetitionFormField, string>>,
  field: CompetitionFormField,
): string | undefined {
  return fieldErrors[field];
}

export default function CompetitionForm({
  competition,
  competitionTypes,
  federations,
  countries,
  catalogError,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionFormProps): React.JSX.Element {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    createCompetitionFormValues(competition),
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
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

  const clientFieldErrors = useMemo(
    () => validateCompetitionFormValues(values),
    [values],
  );
  const serverFieldErrors = useMemo(
    () => resolveCompetitionFormFieldErrors(actionState.error),
    [actionState.error],
  );
  const displayedFieldErrors = useMemo(
    () =>
      hasAttemptedSubmit
        ? { ...serverFieldErrors, ...clientFieldErrors }
        : serverFieldErrors,
    [clientFieldErrors, hasAttemptedSubmit, serverFieldErrors],
  );
  const globalActionError = useMemo(
    () => resolveCompetitionFormGlobalError(actionState.error),
    [actionState.error],
  );
  const globalCatalogError = useMemo(
    () => (catalogError ? resolveCompetitionAdminErrorMessage(catalogError) : null),
    [catalogError],
  );

  const competitionTypeOptions = ensureOption(
    competitionTypes,
    competition?.competitionTypeId
      ? {
          value: competition.competitionTypeId,
          label: competition.competitionTypeId,
        }
      : null,
  );
  const federationOptions = ensureOption(
    federations,
    competition?.federationId
      ? {
          value: competition.federationId,
          label: competition.federationId,
        }
      : null,
  );
  const countryOptions = ensureOption(
    countries,
    competition?.countryId
      ? {
          value: competition.countryId,
          label: competition.countryId,
        }
      : null,
  );

  useEffect(() => {
    if (actionState.status === 'idle') {
      return;
    }

    logCompetitionDebug('CompetitionForm', 'actionState', {
      mode: edit ? 'edit' : 'create',
      status: actionState.status,
      error: actionState.error,
      competitionId: actionState.competitionId,
      competitionSlug: actionState.competitionSlug,
    });

    if (actionState.status === 'error') {
      const globalError = resolveCompetitionFormGlobalError(actionState.error);
      if (globalError) {
        toast.error(globalError);
      }
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
    actionState.competitionSlug,
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

  const handleSelectChange = useCallback(
    (field: SelectField) =>
      (event: ChangeEvent<HTMLSelectElement>) => {
        setValues(previousValues => ({
          ...previousValues,
          [field]: event.target.value,
        }));
      },
    [],
  );

  const handleTextChange = useCallback(
    (field: TextField) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setValues(previousValues => ({
          ...previousValues,
          [field]: event.target.value,
        }));
      },
    [],
  );

  const handleVisibilityChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues(previousValues => ({
        ...previousValues,
        isPublic: event.target.checked,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      setHasAttemptedSubmit(true);

      if (Object.keys(clientFieldErrors).length > 0) {
        event.preventDefault();
      }
    },
    [clientFieldErrors],
  );

  const globalErrorMessage = globalActionError ?? globalCatalogError ?? null;

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      {edit && competition ? (
        <>
          <input type='hidden' name='competitionId' value={competition.id} />
          <input
            type='hidden'
            name='original_competitionTypeId'
            value={competition.competitionTypeId}
          />
          <input type='hidden' name='original_name' value={competition.name} />
          <input
            type='hidden'
            name='original_originalName'
            value={competition.originalName ?? ''}
          />
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
            name='original_isPublic'
            value={competition.isPublic ? 'true' : 'false'}
          />
        </>
      ) : null}

      <Card>
        <Grid gap={24}>
          <Title size='small'>
            {edit ? 'Competition configuration' : 'Create competition'}
          </Title>

          <Text size='small' color='gray'>
            Code and slug are generated by the backend from the canonical competition
            name.
          </Text>

          {globalErrorMessage ? (
            <Text size='small' color='red'>
              {globalErrorMessage}
            </Text>
          ) : null}

          <Grid gap={16} columns={2}>
            <Section gap={16}>
              <Select
                label='Competition type'
                name='competitionTypeId'
                value={values.competitionTypeId}
                onChange={handleSelectChange('competitionTypeId')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'competition_type_id'))}
                helperText={getFieldError(displayedFieldErrors, 'competition_type_id')}
              >
                <option value=''>Select a competition type</option>
                {competitionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <TextInput
                label='Name'
                name='name'
                placeholder='Primera División'
                value={values.name}
                onChange={handleTextChange('name')}
                required
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'name'))}
                helperText={getFieldError(displayedFieldErrors, 'name')}
              />

              <TextInput
                label='Original name'
                name='originalName'
                placeholder='Campeonato Nacional de Liga de Primera División'
                value={values.originalName}
                onChange={handleTextChange('originalName')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'original_name'))}
                helperText={getFieldError(displayedFieldErrors, 'original_name')}
              />

              <Select
                label='Federation'
                name='federationId'
                value={values.federationId}
                onChange={handleSelectChange('federationId')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'federation_id'))}
                helperText={getFieldError(displayedFieldErrors, 'federation_id')}
              >
                <option value=''>No federation</option>
                {federationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label='Country'
                name='countryId'
                value={values.countryId}
                onChange={handleSelectChange('countryId')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'country_id'))}
                helperText={getFieldError(displayedFieldErrors, 'country_id')}
              >
                <option value=''>No country</option>
                {countryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <TextInput
                label='Started on'
                name='startedOn'
                type='date'
                value={formatDateForInput(values.startedOn)}
                onChange={handleTextChange('startedOn')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'started_on'))}
                helperText={getFieldError(displayedFieldErrors, 'started_on')}
              />

              <TextInput
                label='Ended on'
                name='endedOn'
                type='date'
                value={formatDateForInput(values.endedOn)}
                onChange={handleTextChange('endedOn')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'ended_on'))}
                helperText={getFieldError(displayedFieldErrors, 'ended_on')}
              />

              <NumberInput
                label='Sort order'
                name='sortOrder'
                type='number'
                min='0'
                value={values.sortOrder}
                onChange={handleTextChange('sortOrder')}
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'sort_order'))}
                helperText={getFieldError(displayedFieldErrors, 'sort_order')}
              />

              <Grid gap={8}>
                <CheckBoxInput
                  key={values.isPublic ? 'public-true' : 'public-false'}
                  label='Public visibility'
                  name='isPublic'
                  value='true'
                  defaultChecked={values.isPublic}
                  disabled={isPending}
                  onChange={handleVisibilityChange}
                />
                {getFieldError(displayedFieldErrors, 'is_public') ? (
                  <Text size='small' color='red'>
                    {getFieldError(displayedFieldErrors, 'is_public')}
                  </Text>
                ) : null}
              </Grid>
            </Section>

            {edit && competition ? (
              <Section gap={16}>
                <TextInput label='ID' defaultValue={competition.id} readOnly disabled />
                <TextInput label='Code' defaultValue={competition.code} readOnly disabled />
                <TextInput label='Slug' defaultValue={competition.slug} readOnly disabled />
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
