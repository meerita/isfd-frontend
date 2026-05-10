/** @format */

import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { isUuid } from '@/_helpers/uuid';
import type { ApiErrorResponse } from '@/_types/api';
import type { Competition } from '@/_types/competition';
import type { CompetitionType } from '@/_types/competitionType';
import type { Country } from '@/_types/country';
import type { FederationListItem } from '@/_types/federation';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type CompetitionFormField =
  | 'competition_type_id'
  | 'federation_id'
  | 'country_id'
  | 'name'
  | 'original_name'
  | 'started_on'
  | 'ended_on'
  | 'sort_order'
  | 'is_public';

export type CompetitionTypeOption = Readonly<{
  value: string;
  label: string;
}>;

export type CompetitionSelectOption = Readonly<{
  value: string;
  label: string;
}>;

export type CompetitionFormValues = {
  competitionTypeId: string;
  federationId: string;
  countryId: string;
  name: string;
  originalName: string;
  startedOn: string;
  endedOn: string;
  sortOrder: string;
  isPublic: boolean;
};

export type CompetitionFormFieldErrors = Partial<
  Record<CompetitionFormField, string>
>;

const FIELD_REASON_MAP: Readonly<Record<CompetitionFormField, ReadonlyArray<string>>> = {
  competition_type_id: [
    'COMPETITION_TYPE_ID_REQUIRED',
    'COMPETITION_COMPETITION_TYPE_ID_REQUIRED',
    'COMPETITION_INVALID_COMPETITION_TYPE_ID',
  ],
  federation_id: ['COMPETITION_INVALID_FEDERATION_ID'],
  country_id: ['COMPETITION_INVALID_COUNTRY_ID'],
  name: ['COMPETITION_NAME_REQUIRED', 'COMPETITION_NAME_TOO_LONG'],
  original_name: [
    'COMPETITION_ORIGINAL_NAME_BLANK',
    'COMPETITION_ORIGINAL_NAME_TOO_LONG',
  ],
  started_on: ['COMPETITION_INVALID_STARTED_ON'],
  ended_on: [
    'COMPETITION_INVALID_ENDED_ON',
    'COMPETITION_ENDED_ON_BEFORE_STARTED_ON',
  ],
  sort_order: ['COMPETITION_INVALID_SORT_ORDER'],
  is_public: ['COMPETITION_PUBLIC_VALUE_REQUIRED', 'COMPETITION_ACTIVE_VALUE_REQUIRED'],
};

const GLOBAL_ONLY_REASONS = new Set([
  'INVALID_REQUEST',
  'INVALID_PAGINATION',
  'INVALID_SORT',
  'INTERNAL_SERVER_ERROR',
  'COMPETITION_NOT_FOUND',
  'COMPETITION_HAS_RELATIONS',
  'COMPETITION_CODE_GENERATION_FAILED',
  'COMPETITION_CODE_ALREADY_EXISTS',
  'COMPETITION_SLUG_ALREADY_EXISTS',
  'COMPETITION_SLUG_GENERATION_FAILED',
]);

export function mapCompetitionTypeOptions(
  competitionTypes: ReadonlyArray<CompetitionType>,
): ReadonlyArray<CompetitionTypeOption> {
  return competitionTypes.map(item => ({
    value: item.id,
    label: item.name,
  }));
}

export function mapCompetitionSelectOptions(
  items: ReadonlyArray<FederationListItem | Country>,
): ReadonlyArray<CompetitionSelectOption> {
  return items.map(item => ({
    value: item.id,
    label: item.name,
  }));
}

export function createCompetitionFormValues(
  competition?: Competition | null,
): CompetitionFormValues {
  return {
    competitionTypeId: competition?.competitionTypeId ?? '',
    federationId: competition?.federationId ?? '',
    countryId: competition?.countryId ?? '',
    name: competition?.name ?? '',
    originalName: competition?.originalName ?? '',
    startedOn: competition?.startedOn ?? '',
    endedOn: competition?.endedOn ?? '',
    sortOrder:
      typeof competition?.sortOrder === 'number'
        ? String(competition.sortOrder)
        : '',
    isPublic: competition?.isPublic ?? true,
  };
}

export function ensureOption<T extends { value: string }>(
  options: ReadonlyArray<T>,
  fallbackOption?: T | null,
): ReadonlyArray<T> {
  if (!fallbackOption) return options;
  if (options.some(option => option.value === fallbackOption.value)) {
    return options;
  }

  return [fallbackOption, ...options];
}

export function validateCompetitionFormValues(
  values: CompetitionFormValues,
): CompetitionFormFieldErrors {
  const errors: CompetitionFormFieldErrors = {};
  const normalizedName = values.name.trim();
  const normalizedOriginalName = values.originalName.trim();
  const normalizedSortOrder = values.sortOrder.trim();

  if (!values.competitionTypeId.trim()) {
    errors.competition_type_id = 'Competition type is required.';
  } else if (!isUuid(values.competitionTypeId)) {
    errors.competition_type_id = 'Select a valid competition type.';
  }

  if (!normalizedName) {
    errors.name = 'Competition name is required.';
  } else if (normalizedName.length > 200) {
    errors.name = 'Competition name is too long.';
  }

  if (values.originalName && !normalizedOriginalName) {
    errors.original_name = 'Original name cannot be blank when it is provided.';
  } else if (normalizedOriginalName.length > 200) {
    errors.original_name = 'Original name is too long.';
  }

  if (values.federationId && !isUuid(values.federationId)) {
    errors.federation_id = 'Select a valid federation.';
  }

  if (values.countryId && !isUuid(values.countryId)) {
    errors.country_id = 'Select a valid country.';
  }

  if (values.startedOn && !DATE_PATTERN.test(values.startedOn.trim())) {
    errors.started_on = 'Enter a valid start date.';
  }

  if (values.endedOn && !DATE_PATTERN.test(values.endedOn.trim())) {
    errors.ended_on = 'Enter a valid end date.';
  }

  if (
    !errors.started_on &&
    !errors.ended_on &&
    values.startedOn &&
    values.endedOn &&
    values.endedOn < values.startedOn
  ) {
    errors.ended_on = 'End date cannot be before the start date.';
  }

  if (
    normalizedSortOrder &&
    (!/^\d+$/.test(normalizedSortOrder) || Number(normalizedSortOrder) < 0)
  ) {
    errors.sort_order = 'Enter a valid sort order.';
  }

  return errors;
}

export function resolveCompetitionFormFieldErrors(
  error?: ApiErrorResponse,
): CompetitionFormFieldErrors {
  if (!error) {
    return {};
  }

  const resolvedMessage = resolveCompetitionAdminErrorMessage(error);

  return Object.entries(FIELD_REASON_MAP).reduce<CompetitionFormFieldErrors>(
    (accumulator, [fieldName, reasons]) => {
      if (reasons.includes(error.reason)) {
        accumulator[fieldName as CompetitionFormField] = resolvedMessage;
      }

      return accumulator;
    },
    {},
  );
}

export function resolveCompetitionFormGlobalError(
  error?: ApiErrorResponse,
): string | null {
  if (!error) {
    return null;
  }

  const hasFieldMapping = Object.values(FIELD_REASON_MAP).some(reasons =>
    reasons.includes(error.reason),
  );

  if (!hasFieldMapping || GLOBAL_ONLY_REASONS.has(error.reason)) {
    return resolveCompetitionAdminErrorMessage(error);
  }

  return null;
}

export type CompetitionResolvedLabels = Readonly<{
  competitionTypeLabel: string | null;
  federationLabel: string | null;
  countryLabel: string | null;
}>;

export function resolveCompetitionLabels(
  competition: Competition,
  catalogs: Readonly<{
    competitionTypes: ReadonlyArray<CompetitionTypeOption>;
    federations: ReadonlyArray<CompetitionSelectOption>;
    countries: ReadonlyArray<CompetitionSelectOption>;
  }>,
): CompetitionResolvedLabels {
  const competitionTypeMap = new Map(
    catalogs.competitionTypes.map(item => [item.value, item.label]),
  );
  const federationMap = new Map(
    catalogs.federations.map(item => [item.value, item.label]),
  );
  const countryMap = new Map(
    catalogs.countries.map(item => [item.value, item.label]),
  );

  return {
    competitionTypeLabel:
      competitionTypeMap.get(competition.competitionTypeId) ??
      competition.competitionTypeId,
    federationLabel: competition.federationId
      ? federationMap.get(competition.federationId) ?? competition.federationId
      : null,
    countryLabel: competition.countryId
      ? countryMap.get(competition.countryId) ?? competition.countryId
      : null,
  };
}
