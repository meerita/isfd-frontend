/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createCompetition } from '@/_actions/competition/createCompetition';
import {
  getCompetitionTierCatalog,
} from '@/_actions/competition/getCompetitionCatalogs';
import { updateCompetition } from '@/_actions/competition/updateCompetition';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import FieldSet from '@/_components/forms/Fieldset';
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
  ensureTierOptions,
  filterCompetitionPyramids,
  normalizeCompetitionCode,
  resolveCompetitionFormFieldErrors,
  resolveCompetitionFormGlobalError,
  type CompetitionFormField,
  type CompetitionPyramidOption,
  type CompetitionSelectOption,
  type CompetitionTierOption,
  type CompetitionTypeOption,
  validateCompetitionFormValues,
} from '../_lib/competitionAdmin';
import {
  formatDateForInput,
  formatDateTime,
} from '../../_components/utils';

const INITIAL_STATE: CompetitionActionState = { status: 'idle' };

type CompetitionFormProps = Readonly<{
  competition?: Competition | null;
  competitionTypes: ReadonlyArray<CompetitionTypeOption>;
  federations: ReadonlyArray<CompetitionSelectOption>;
  countries: ReadonlyArray<CompetitionSelectOption>;
  competitionPyramids: ReadonlyArray<CompetitionPyramidOption>;
  competitionTiers?: ReadonlyArray<CompetitionTierOption>;
  catalogError?: ApiErrorResponse;
  initialTierError?: ApiErrorResponse;
  edit?: boolean;
  cancelHref?: string;
  successHref?: string;
}>;

type SelectField =
  | 'competitionTypeId'
  | 'federationId'
  | 'countryId'
  | 'competitionPyramidId';

type TextField =
  | 'code'
  | 'name'
  | 'originalName'
  | 'startedOn'
  | 'endedOn'
  | 'sortOrder';

function buildTierSignature(
  competitionPyramidId: string,
  participantScope: string | null,
): string {
  return `${competitionPyramidId}::${participantScope ?? ''}`;
}

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
  competitionPyramids,
  competitionTiers = [],
  catalogError,
  initialTierError,
  edit = false,
  cancelHref,
  successHref,
}: CompetitionFormProps): React.JSX.Element {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    createCompetitionFormValues(competition),
  );
  const [tierOptions, setTierOptions] = useState<ReadonlyArray<CompetitionTierOption>>(
    competitionTiers,
  );
  const [tierError, setTierError] = useState<string | null>(
    initialTierError ? resolveCompetitionAdminErrorMessage(initialTierError) : null,
  );
  const [isTierPending, setIsTierPending] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const latestTierRequest = useRef(0);
  const lastLoadedTierSignature = useRef(
    values.competitionPyramidId
      ? buildTierSignature(
          values.competitionPyramidId,
          competitionTypes.find(
            option => option.value === values.competitionTypeId,
          )?.participantScope ?? null,
        )
      : '',
  );
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

  const selectedCompetitionType = useMemo(
    () =>
      competitionTypes.find(option => option.value === values.competitionTypeId) ??
      null,
    [competitionTypes, values.competitionTypeId],
  );

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
          participantScope: null,
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
  const availablePyramidOptions = ensureOption(
    filterCompetitionPyramids(
      competitionPyramids,
      values.countryId,
      values.federationId,
    ),
    competition?.competitionPyramidId &&
    values.countryId === (competition.countryId ?? '') &&
    values.federationId === (competition.federationId ?? '')
      ? {
          value: competition.competitionPyramidId,
          label: competition.competitionPyramidId,
          countryId: competition.countryId ?? '',
          federationId: competition.federationId,
          scopeKind: null,
          branchKind: null,
        }
      : null,
  );
  const tierOptionsWithFallback = ensureTierOptions(
    tierOptions,
    [
      values.primaryCompetitionTierId,
      ...values.allowedCompetitionTierIds,
    ].filter(Boolean),
    competition?.competitionPyramidId ?? values.competitionPyramidId,
  );
  const visibleTierOptions = useMemo(
    () =>
      tierOptionsWithFallback.filter(
        option => option.competitionPyramidId === values.competitionPyramidId,
      ),
    [tierOptionsWithFallback, values.competitionPyramidId],
  );
  const visibleTierIds = useMemo(
    () => new Set(visibleTierOptions.map(option => option.value)),
    [visibleTierOptions],
  );

  useEffect(() => {
    if (!values.competitionPyramidId) {
      return;
    }

    const participantScope = selectedCompetitionType?.participantScope ?? null;
    const signature = buildTierSignature(
      values.competitionPyramidId,
      participantScope,
    );

    if (signature === lastLoadedTierSignature.current) {
      return;
    }

    const requestId = latestTierRequest.current + 1;
    latestTierRequest.current = requestId;
    lastLoadedTierSignature.current = signature;
    setIsTierPending(true);
    setTierError(null);

    queueMicrotask(() => {
      void (async () => {
        try {
          const response = await getCompetitionTierCatalog(
            values.competitionPyramidId,
            participantScope,
          );

          if (latestTierRequest.current !== requestId) {
            return;
          }

          const nextTierOptions = response.competitionTiers.map(item => ({
            value: item.id,
            label:
              item.levelOrder !== null
                ? `${item.levelOrder} · ${item.name}`
                : item.name,
            competitionPyramidId: item.competitionPyramidId,
            participantScope: item.participantScope,
            scopeKind: item.scopeKind,
            branchKind: item.branchKind,
            levelOrder: item.levelOrder,
          }));

          setTierOptions(nextTierOptions);
          setTierError(
            response.error ? resolveCompetitionAdminErrorMessage(response.error) : null,
          );
          setValues(previousValues => {
            const nextAllowedTierIds =
              previousValues.allowedCompetitionTierIds.filter(tierId =>
                nextTierOptions.some(option => option.value === tierId),
              );
            const nextPrimaryTierId = nextTierOptions.some(
              option => option.value === previousValues.primaryCompetitionTierId,
            )
              ? previousValues.primaryCompetitionTierId
              : '';

            return {
              ...previousValues,
              primaryCompetitionTierId: nextPrimaryTierId,
              allowedCompetitionTierIds:
                nextPrimaryTierId &&
                !nextAllowedTierIds.includes(nextPrimaryTierId)
                  ? [...nextAllowedTierIds, nextPrimaryTierId]
                  : nextAllowedTierIds,
            };
          });
        } catch (error) {
          if (latestTierRequest.current !== requestId) {
            return;
          }

          console.error('Failed to load competition tiers for the selected pyramid', error);
          setTierOptions([]);
          setTierError('We could not load competition tiers for the selected pyramid.');
        } finally {
          if (latestTierRequest.current === requestId) {
            setIsTierPending(false);
          }
        }
      })();
    });
  }, [selectedCompetitionType?.participantScope, values.competitionPyramidId]);

  useEffect(() => {
    if (actionState.status === 'idle') {
      return;
    }

    logCompetitionDebug('CompetitionForm', 'actionState', {
      mode: edit ? 'edit' : 'create',
      status: actionState.status,
      error: actionState.error,
      competitionId: actionState.competitionId,
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
        const nextValue = event.target.value;

        setValues(previousValues => {
          if (field === 'competitionPyramidId') {
            lastLoadedTierSignature.current = '';
            setTierOptions([]);
            setTierError(null);

            return {
              ...previousValues,
              competitionPyramidId: nextValue,
              primaryCompetitionTierId: '',
              allowedCompetitionTierIds: [],
            };
          }

          const nextValues = {
            ...previousValues,
            [field]: nextValue,
          };

          if (
            previousValues.competitionPyramidId &&
            !filterCompetitionPyramids(
              competitionPyramids,
              nextValues.countryId,
              nextValues.federationId,
            ).some(option => option.value === previousValues.competitionPyramidId)
          ) {
            lastLoadedTierSignature.current = '';
            setTierOptions([]);
            setTierError(null);

            return {
              ...nextValues,
              competitionPyramidId: '',
              primaryCompetitionTierId: '',
              allowedCompetitionTierIds: [],
            };
          }

          return nextValues;
        });
      },
    [competitionPyramids],
  );

  const handleTextChange = useCallback(
    (field: TextField) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue =
          field === 'code' ? event.target.value.toUpperCase() : event.target.value;

        setValues(previousValues => ({
          ...previousValues,
          [field]: nextValue,
        }));
      },
    [],
  );

  const handleCodeBlur = useCallback(() => {
    setValues(previousValues => ({
      ...previousValues,
      code: normalizeCompetitionCode(previousValues.code),
    }));
  }, []);

  const handleActiveChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues(previousValues => ({
        ...previousValues,
        isActive: event.target.checked,
      }));
    },
    [],
  );

  const handlePrimaryTierChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextPrimaryTierId = event.target.value;

      setValues(previousValues => ({
        ...previousValues,
        primaryCompetitionTierId: nextPrimaryTierId,
        allowedCompetitionTierIds:
          nextPrimaryTierId &&
          !previousValues.allowedCompetitionTierIds.includes(nextPrimaryTierId)
            ? [...previousValues.allowedCompetitionTierIds, nextPrimaryTierId]
            : previousValues.allowedCompetitionTierIds,
      }));
    },
    [],
  );

  const handleAllowedTierChange = useCallback(
    (tierId: string, checked: boolean) => {
      setValues(previousValues => {
        const nextAllowedTierIds = checked
          ? previousValues.allowedCompetitionTierIds.includes(tierId)
            ? previousValues.allowedCompetitionTierIds
            : [...previousValues.allowedCompetitionTierIds, tierId]
          : previousValues.allowedCompetitionTierIds.filter(id => id !== tierId);

        return {
          ...previousValues,
          allowedCompetitionTierIds: nextAllowedTierIds,
          primaryCompetitionTierId:
            !checked && previousValues.primaryCompetitionTierId === tierId
              ? ''
              : previousValues.primaryCompetitionTierId,
        };
      });
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

  const globalErrorMessage =
    globalActionError ?? globalCatalogError ?? null;

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
          <input type='hidden' name='original_code' value={competition.code} />
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
            name='original_competitionPyramidId'
            value={competition.competitionPyramidId ?? ''}
          />
          <input
            type='hidden'
            name='original_primaryCompetitionTierId'
            value={competition.primaryCompetitionTierId ?? ''}
          />
          <input
            type='hidden'
            name='original_allowedCompetitionTierIds'
            value={JSON.stringify(competition.allowedCompetitionTierIds)}
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
                label='Code'
                name='code'
                placeholder='LA_LIGA'
                value={values.code}
                onChange={handleTextChange('code')}
                onBlur={handleCodeBlur}
                required
                disabled={isPending}
                error={Boolean(getFieldError(displayedFieldErrors, 'code'))}
                helperText={
                  getFieldError(displayedFieldErrors, 'code') ??
                  'Use uppercase letters, numbers, and underscores.'
                }
              />
              <TextInput
                label='Name'
                name='name'
                placeholder='La Liga'
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
              <Select
                label='Competition pyramid'
                name='competitionPyramidId'
                value={values.competitionPyramidId}
                onChange={handleSelectChange('competitionPyramidId')}
                disabled={isPending}
                error={Boolean(
                  getFieldError(displayedFieldErrors, 'competition_pyramid_id'),
                )}
                helperText={getFieldError(
                  displayedFieldErrors,
                  'competition_pyramid_id',
                )}
              >
                <option value=''>No competition pyramid</option>
                {availablePyramidOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label='Primary competition tier'
                name='primaryCompetitionTierId'
                value={values.primaryCompetitionTierId}
                onChange={handlePrimaryTierChange}
                disabled={isPending || !values.competitionPyramidId || isTierPending}
                error={Boolean(
                  getFieldError(
                    displayedFieldErrors,
                    'primary_competition_tier_id',
                  ),
                )}
                helperText={
                  getFieldError(
                    displayedFieldErrors,
                    'primary_competition_tier_id',
                  ) ??
                  (!values.competitionPyramidId
                    ? 'Select a competition pyramid first.'
                    : undefined)
                }
              >
                <option value=''>No primary tier</option>
                {visibleTierOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FieldSet disabled={isPending || !values.competitionPyramidId || isTierPending} display='grid' gap={8}>
                <Text size='small' weight='semibold'>
                  Allowed competition tiers
                </Text>
                {getFieldError(displayedFieldErrors, 'allowed_competition_tier_ids') ? (
                  <Text size='small' color='red'>
                    {getFieldError(displayedFieldErrors, 'allowed_competition_tier_ids')}
                  </Text>
                ) : null}
                {!values.competitionPyramidId ? (
                  <Text size='small' color='gray'>
                    Select a competition pyramid to choose the allowed tiers.
                  </Text>
                ) : isTierPending ? (
                  <Text size='small' color='gray'>
                    Loading competition tiers...
                  </Text>
                ) : tierError ? (
                  <Text size='small' color='red'>
                    {tierError}
                  </Text>
                ) : visibleTierOptions.length === 0 ? (
                  <Text size='small' color='gray'>
                    No tiers are available for the selected competition pyramid.
                  </Text>
                ) : (
                  <Grid gap={8}>
                    {visibleTierOptions.map(option => {
                      const isChecked = values.allowedCompetitionTierIds.includes(
                        option.value,
                      );

                      return (
                        <CheckBoxInput
                          key={`${option.value}-${isChecked ? 'checked' : 'unchecked'}`}
                          label={option.label}
                          name='allowedCompetitionTierIds'
                          value={option.value}
                          defaultChecked={isChecked}
                          onChange={event =>
                            handleAllowedTierChange(option.value, event.target.checked)
                          }
                        />
                      );
                    })}
                  </Grid>
                )}
              </FieldSet>
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
                  key={values.isActive ? 'active-true' : 'active-false'}
                  label='Active'
                  name='isActive'
                  value='true'
                  defaultChecked={values.isActive}
                  disabled={isPending}
                  onChange={handleActiveChange}
                />
                {getFieldError(displayedFieldErrors, 'is_active') ? (
                  <Text size='small' color='red'>
                    {getFieldError(displayedFieldErrors, 'is_active')}
                  </Text>
                ) : null}
              </Grid>
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
                {values.competitionPyramidId &&
                values.primaryCompetitionTierId &&
                !visibleTierIds.has(values.primaryCompetitionTierId) ? (
                  <Text size='small' color='gray'>
                    The selected primary tier no longer belongs to the active pyramid catalog.
                  </Text>
                ) : null}
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
