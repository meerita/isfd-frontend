/** @format */

import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type { ApiErrorResponse } from '@/_types/api';
import type { Competition } from '@/_types/competition';
import type { CompetitionPyramid, CompetitionTier } from '@/_types/competitionStructure';
import type { CompetitionType } from '@/_types/competitionType';
import type { Country } from '@/_types/country';
import type { FederationListItem } from '@/_types/federation';

const CODE_PATTERN = /^[A-Z0-9_]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type CompetitionFormField =
  | 'competition_type_id'
  | 'federation_id'
  | 'country_id'
  | 'competition_pyramid_id'
  | 'primary_competition_tier_id'
  | 'allowed_competition_tier_ids'
  | 'code'
  | 'name'
  | 'original_name'
  | 'started_on'
  | 'ended_on'
  | 'sort_order'
  | 'is_active';

export type CompetitionTypeOption = Readonly<{
  value: string;
  label: string;
  participantScope: string | null;
}>;

export type CompetitionSelectOption = Readonly<{
  value: string;
  label: string;
}>;

export type CompetitionPyramidOption = Readonly<{
  value: string;
  label: string;
  countryId: string;
  federationId: string | null;
  scopeKind: string | null;
  branchKind: string | null;
}>;

export type CompetitionTierOption = Readonly<{
  value: string;
  label: string;
  competitionPyramidId: string;
  participantScope: string | null;
  scopeKind: string | null;
  branchKind: string | null;
  levelOrder: number | null;
}>;

export type CompetitionFormValues = {
  competitionTypeId: string;
  federationId: string;
  countryId: string;
  competitionPyramidId: string;
  primaryCompetitionTierId: string;
  allowedCompetitionTierIds: string[];
  code: string;
  name: string;
  originalName: string;
  startedOn: string;
  endedOn: string;
  sortOrder: string;
  isActive: boolean;
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
  competition_pyramid_id: [
    'COMPETITION_PYRAMID_ID_REQUIRED',
    'COMPETITION_INVALID_COMPETITION_PYRAMID_ID',
    'COMPETITION_PRIMARY_TIER_REQUIRES_PYRAMID',
    'COMPETITION_ALLOWED_TIERS_REQUIRE_PYRAMID',
  ],
  primary_competition_tier_id: [
    'PRIMARY_COMPETITION_TIER_ID_REQUIRED',
    'COMPETITION_INVALID_PRIMARY_COMPETITION_TIER_ID',
    'COMPETITION_PRIMARY_TIER_MUST_BE_ALLOWED',
    'COMPETITION_TIER_BELONGS_TO_ANOTHER_PYRAMID',
  ],
  allowed_competition_tier_ids: [
    'COMPETITION_INVALID_ALLOWED_COMPETITION_TIER_ID',
    'COMPETITION_DUPLICATE_ALLOWED_COMPETITION_TIER_IDS',
    'COMPETITION_PRIMARY_TIER_MUST_BE_ALLOWED',
    'COMPETITION_TIER_BELONGS_TO_ANOTHER_PYRAMID',
  ],
  code: [
    'COMPETITION_CODE_REQUIRED',
    'COMPETITION_CODE_TOO_LONG',
    'COMPETITION_CODE_MUST_BE_UPPERCASE',
    'COMPETITION_CODE_INVALID_FORMAT',
    'COMPETITION_CODE_ALREADY_EXISTS',
  ],
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
  is_active: ['COMPETITION_ACTIVE_VALUE_REQUIRED'],
};

const GLOBAL_ONLY_REASONS = new Set([
  'INVALID_REQUEST',
  'INVALID_PAGINATION',
  'INVALID_SORT',
  'INTERNAL_SERVER_ERROR',
  'COMPETITION_NOT_FOUND',
  'COMPETITION_HAS_RELATIONS',
  'COMPETITION_SLUG_ALREADY_EXISTS',
  'COMPETITION_SLUG_GENERATION_FAILED',
]);

export function mapCompetitionTypeOptions(
  competitionTypes: ReadonlyArray<CompetitionType>,
): ReadonlyArray<CompetitionTypeOption> {
  return competitionTypes.map(item => ({
    value: item.id,
    label: item.name,
    participantScope: item.participantScope,
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

export function formatCompetitionTierLabel(
  name: string,
  levelOrder: number | null,
): string {
  return levelOrder !== null ? `${levelOrder} · ${name}` : name;
}

export function mapCompetitionPyramidOptions(
  competitionPyramids: ReadonlyArray<CompetitionPyramid>,
): ReadonlyArray<CompetitionPyramidOption> {
  return competitionPyramids.map(item => ({
    value: item.id,
    label: item.name,
    countryId: item.countryId,
    federationId: item.federationId,
    scopeKind: item.scopeKind,
    branchKind: item.branchKind,
  }));
}

export function mapCompetitionTierOptions(
  competitionTiers: ReadonlyArray<CompetitionTier>,
): ReadonlyArray<CompetitionTierOption> {
  return competitionTiers.map(item => ({
    value: item.id,
    label: formatCompetitionTierLabel(item.name, item.levelOrder),
    competitionPyramidId: item.competitionPyramidId,
    participantScope: item.participantScope,
    scopeKind: item.scopeKind,
    branchKind: item.branchKind,
    levelOrder: item.levelOrder,
  }));
}

export function createCompetitionFormValues(
  competition?: Competition | null,
): CompetitionFormValues {
  return {
    competitionTypeId: competition?.competitionTypeId ?? '',
    federationId: competition?.federationId ?? '',
    countryId: competition?.countryId ?? '',
    competitionPyramidId: competition?.competitionPyramidId ?? '',
    primaryCompetitionTierId: competition?.primaryCompetitionTierId ?? '',
    allowedCompetitionTierIds: competition?.allowedCompetitionTierIds
      ? [...competition.allowedCompetitionTierIds]
      : [],
    code: competition?.code ?? '',
    name: competition?.name ?? '',
    originalName: competition?.originalName ?? '',
    startedOn: competition?.startedOn ?? '',
    endedOn: competition?.endedOn ?? '',
    sortOrder:
      typeof competition?.sortOrder === 'number'
        ? String(competition.sortOrder)
        : '',
    isActive: competition?.isActive ?? true,
  };
}

export function normalizeCompetitionCode(value: string): string {
  return value.trim().toUpperCase();
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

export function ensureTierOptions(
  options: ReadonlyArray<CompetitionTierOption>,
  selectedTierIds: ReadonlyArray<string>,
  competitionPyramidId: string,
): ReadonlyArray<CompetitionTierOption> {
  const missingOptions = selectedTierIds
    .filter(tierId => !options.some(option => option.value === tierId))
    .map<CompetitionTierOption>(tierId => ({
      value: tierId,
      label: tierId,
      competitionPyramidId,
      participantScope: null,
      scopeKind: null,
      branchKind: null,
      levelOrder: null,
    }));

  return [...missingOptions, ...options];
}

export function filterCompetitionPyramids(
  options: ReadonlyArray<CompetitionPyramidOption>,
  countryId: string,
  federationId: string,
): ReadonlyArray<CompetitionPyramidOption> {
  return options.filter(option => {
    if (countryId && option.countryId !== countryId) {
      return false;
    }

    if (federationId && option.federationId !== federationId) {
      return false;
    }

    return true;
  });
}

export function validateCompetitionFormValues(
  values: CompetitionFormValues,
): CompetitionFormFieldErrors {
  const errors: CompetitionFormFieldErrors = {};
  const normalizedCode = normalizeCompetitionCode(values.code);
  const normalizedName = values.name.trim();
  const normalizedSortOrder = values.sortOrder.trim();

  if (!values.competitionTypeId.trim()) {
    errors.competition_type_id = 'Competition type is required.';
  }

  if (!normalizedCode) {
    errors.code = 'Competition code is required.';
  } else if (!CODE_PATTERN.test(normalizedCode)) {
    errors.code =
      'Competition code must use uppercase letters, numbers, and underscores.';
  }

  if (!normalizedName) {
    errors.name = 'Competition name is required.';
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

  if (!values.competitionPyramidId && values.primaryCompetitionTierId) {
    errors.competition_pyramid_id =
      'Primary competition tier requires a competition pyramid.';
    errors.primary_competition_tier_id =
      'Primary competition tier requires a competition pyramid.';
  }

  if (
    !values.competitionPyramidId &&
    values.allowedCompetitionTierIds.length > 0
  ) {
    errors.competition_pyramid_id =
      'Allowed competition tiers require a competition pyramid.';
    errors.allowed_competition_tier_ids =
      'Allowed competition tiers require a competition pyramid.';
  }

  if (
    values.primaryCompetitionTierId &&
    !values.allowedCompetitionTierIds.includes(values.primaryCompetitionTierId)
  ) {
    errors.primary_competition_tier_id =
      'Primary competition tier must be included in the allowed tiers.';
    errors.allowed_competition_tier_ids =
      'Primary competition tier must be included in the allowed tiers.';
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
  pyramidLabel: string | null;
  primaryTierLabel: string | null;
  allowedTierLabels: ReadonlyArray<string>;
}>;

export function resolveCompetitionLabels(
  competition: Competition,
  catalogs: Readonly<{
    competitionTypes: ReadonlyArray<CompetitionTypeOption>;
    federations: ReadonlyArray<CompetitionSelectOption>;
    countries: ReadonlyArray<CompetitionSelectOption>;
    competitionPyramids: ReadonlyArray<CompetitionPyramidOption>;
    competitionTiers: ReadonlyArray<CompetitionTierOption>;
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
  const pyramidMap = new Map(
    catalogs.competitionPyramids.map(item => [item.value, item.label]),
  );
  const tierMap = new Map(
    catalogs.competitionTiers.map(item => [item.value, item.label]),
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
    pyramidLabel: competition.competitionPyramidId
      ? pyramidMap.get(competition.competitionPyramidId) ??
        competition.competitionPyramidId
      : null,
    primaryTierLabel: competition.primaryCompetitionTierId
      ? tierMap.get(competition.primaryCompetitionTierId) ??
        competition.primaryCompetitionTierId
      : null,
    allowedTierLabels: competition.allowedCompetitionTierIds.map(
      tierId => tierMap.get(tierId) ?? tierId,
    ),
  };
}
