/** @format */

import type {
  CompetitionActionState,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
} from '@/_types/competition';

const UNSET = Symbol('unset');
const CODE_PATTERN = /^[A-Z0-9_]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function bool(formData: FormData, key: string, fallback = false): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') return fallback;

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function optionalNumber(value: string): number | null {
  if (!value) return null;

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

function optionalStringArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean);
}

function parseStringArray(value: string): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (DATE_PATTERN.test(value)) return value;
  return null;
}

function uniqueStrings(values: ReadonlyArray<string>): string[] {
  return Array.from(new Set(values));
}

function formError(reason: string, message: string): CompetitionActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function validateNullableUuid(
  value: string | null,
  reason: string,
  message: string,
): CompetitionActionState | null {
  if (!value || UUID_PATTERN.test(value)) return null;
  return formError(reason, message);
}

function partialRequired(value: string, original: string): string | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullable(
  value: string | null,
  original: string | null,
): string | null | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialStringArray(
  value: ReadonlyArray<string>,
  original: ReadonlyArray<string>,
): ReadonlyArray<string> | typeof UNSET {
  if (
    value.length === original.length &&
    value.every((item, index) => item === original[index])
  ) {
    return UNSET;
  }

  return value;
}

type MutableUpdateCompetitionRequest = {
  -readonly [Key in keyof UpdateCompetitionRequest]?: UpdateCompetitionRequest[Key];
};

type NormalizedCompetitionFormInput = Readonly<{
  competitionTypeId: string;
  federationId: string | null;
  countryId: string | null;
  competitionPyramidId: string | null;
  primaryCompetitionTierId: string | null;
  allowedCompetitionTierIds: ReadonlyArray<string>;
  code: string;
  name: string;
  originalName: string | null;
  rawStartedOn: string;
  rawEndedOn: string;
  startedOn: string | null;
  endedOn: string | null;
  rawSortOrder: string;
  sortOrder: number | null;
  isActive: boolean;
}>;

function normalizeCompetitionFormInput(formData: FormData): NormalizedCompetitionFormInput {
  const rawAllowedCompetitionTierIds = optionalStringArray(
    formData,
    'allowedCompetitionTierIds',
  );
  const primaryCompetitionTierId = optionalString(
    str(formData, 'primaryCompetitionTierId'),
  );
  const allowedCompetitionTierIds = uniqueStrings([
    ...rawAllowedCompetitionTierIds,
    ...(primaryCompetitionTierId ? [primaryCompetitionTierId] : []),
  ]);
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const rawSortOrder = str(formData, 'sortOrder');

  return {
    competitionTypeId: str(formData, 'competitionTypeId'),
    federationId: optionalString(str(formData, 'federationId')),
    countryId: optionalString(str(formData, 'countryId')),
    competitionPyramidId: optionalString(str(formData, 'competitionPyramidId')),
    primaryCompetitionTierId,
    allowedCompetitionTierIds,
    code: normalizeCode(str(formData, 'code')),
    name: str(formData, 'name'),
    originalName: optionalString(str(formData, 'originalName')),
    rawStartedOn,
    rawEndedOn,
    startedOn: normalizeDateInput(rawStartedOn),
    endedOn: normalizeDateInput(rawEndedOn),
    rawSortOrder,
    sortOrder: optionalNumber(rawSortOrder),
    isActive: bool(formData, 'isActive', true),
  };
}

function validateCompetitionInput(
  input: NormalizedCompetitionFormInput,
  originalDates?: Readonly<{
    startedOn: string | null;
    endedOn: string | null;
  }>,
): CompetitionActionState | null {
  if (!input.competitionTypeId) {
    return formError('COMPETITION_TYPE_ID_REQUIRED', 'Competition type is required.');
  }

  if (!UUID_PATTERN.test(input.competitionTypeId)) {
    return formError(
      'COMPETITION_INVALID_COMPETITION_TYPE_ID',
      'Select a valid competition type.',
    );
  }

  if (!input.code) {
    return formError('COMPETITION_CODE_REQUIRED', 'Competition code is required.');
  }

  if (!CODE_PATTERN.test(input.code)) {
    return formError(
      'COMPETITION_CODE_INVALID_FORMAT',
      'Competition code must use uppercase letters, numbers, and underscores.',
    );
  }

  if (!input.name) {
    return formError('COMPETITION_NAME_REQUIRED', 'Competition name is required.');
  }

  const validationError = [
    validateNullableUuid(
      input.federationId,
      'COMPETITION_INVALID_FEDERATION_ID',
      'Select a valid federation.',
    ),
    validateNullableUuid(
      input.countryId,
      'COMPETITION_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      input.competitionPyramidId,
      'COMPETITION_INVALID_COMPETITION_PYRAMID_ID',
      'Select a valid competition pyramid.',
    ),
    validateNullableUuid(
      input.primaryCompetitionTierId,
      'COMPETITION_INVALID_PRIMARY_COMPETITION_TIER_ID',
      'Select a valid primary competition tier.',
    ),
    ...input.allowedCompetitionTierIds.map(value =>
      validateNullableUuid(
        value,
        'COMPETITION_INVALID_ALLOWED_COMPETITION_TIER_ID',
        'One allowed competition tier is invalid.',
      ),
    ),
  ].find(Boolean);

  if (validationError) {
    return validationError;
  }

  if (!input.competitionPyramidId && input.primaryCompetitionTierId) {
    return formError(
      'COMPETITION_PRIMARY_TIER_REQUIRES_PYRAMID',
      'Primary competition tier requires a competition pyramid.',
    );
  }

  if (
    !input.competitionPyramidId &&
    input.allowedCompetitionTierIds.length > 0
  ) {
    return formError(
      'COMPETITION_ALLOWED_TIERS_REQUIRE_PYRAMID',
      'Allowed competition tiers require a competition pyramid.',
    );
  }

  if (input.rawStartedOn && !input.startedOn) {
    return formError(
      'COMPETITION_INVALID_STARTED_ON',
      'Enter a valid start date.',
    );
  }

  if (input.rawEndedOn && !input.endedOn) {
    return formError(
      'COMPETITION_INVALID_ENDED_ON',
      'Enter a valid end date.',
    );
  }

  if (input.rawSortOrder && input.sortOrder === null) {
    return formError(
      'COMPETITION_INVALID_SORT_ORDER',
      'Enter a valid sort order.',
    );
  }

  if (input.sortOrder !== null && input.sortOrder < 0) {
    return formError(
      'COMPETITION_INVALID_SORT_ORDER',
      'Enter a valid sort order.',
    );
  }

  const effectiveStartedOn = input.startedOn ?? originalDates?.startedOn ?? null;
  const effectiveEndedOn = input.endedOn ?? originalDates?.endedOn ?? null;

  if (
    effectiveStartedOn &&
    effectiveEndedOn &&
    effectiveEndedOn < effectiveStartedOn
  ) {
    return formError(
      'COMPETITION_ENDED_ON_BEFORE_STARTED_ON',
      'End date cannot be before the start date.',
    );
  }

  return null;
}

export function buildCreateCompetitionBody(
  formData: FormData,
): { body?: CreateCompetitionRequest; error?: CompetitionActionState } {
  const input = normalizeCompetitionFormInput(formData);
  const error = validateCompetitionInput(input);

  if (error) {
    return { error };
  }

  return {
    body: {
      competition_type_id: input.competitionTypeId,
      federation_id: input.federationId,
      country_id: input.countryId,
      competition_pyramid_id: input.competitionPyramidId,
      primary_competition_tier_id: input.primaryCompetitionTierId,
      allowed_competition_tier_ids: input.allowedCompetitionTierIds,
      code: input.code,
      name: input.name,
      original_name: input.originalName,
      started_on: input.startedOn,
      ended_on: input.endedOn,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    },
  };
}

export function buildUpdateCompetitionBody(
  formData: FormData,
): {
  body?: UpdateCompetitionRequest;
  error?: CompetitionActionState;
  competitionId?: string;
} {
  const competitionId = str(formData, 'competitionId');
  if (!competitionId) {
    return {
      error: formError(
        'COMPETITION_ID_REQUIRED',
        'Competition identifier is required.',
      ),
    };
  }

  const input = normalizeCompetitionFormInput(formData);
  const originalStartedOn = optionalString(str(formData, 'original_startedOn'));
  const originalEndedOn = optionalString(str(formData, 'original_endedOn'));
  const error = validateCompetitionInput(input, {
    startedOn: originalStartedOn,
    endedOn: originalEndedOn,
  });

  if (error) {
    return { competitionId, error };
  }

  const body: MutableUpdateCompetitionRequest = {};
  const competitionTypeResult = partialRequired(
    input.competitionTypeId,
    str(formData, 'original_competitionTypeId'),
  );
  const codeResult = partialRequired(
    input.code,
    normalizeCode(str(formData, 'original_code')),
  );
  const nameResult = partialRequired(input.name, str(formData, 'original_name'));
  const originalNameResult = partialNullable(
    input.originalName,
    optionalString(str(formData, 'original_originalName')),
  );
  const federationResult = partialNullable(
    input.federationId,
    optionalString(str(formData, 'original_federationId')),
  );
  const countryResult = partialNullable(
    input.countryId,
    optionalString(str(formData, 'original_countryId')),
  );
  const competitionPyramidResult = partialNullable(
    input.competitionPyramidId,
    optionalString(str(formData, 'original_competitionPyramidId')),
  );
  const primaryCompetitionTierResult = partialNullable(
    input.primaryCompetitionTierId,
    optionalString(str(formData, 'original_primaryCompetitionTierId')),
  );
  const allowedCompetitionTierIdsResult = partialStringArray(
    input.allowedCompetitionTierIds,
    parseStringArray(str(formData, 'original_allowedCompetitionTierIds')),
  );
  const startedOnResult = partialNullable(input.startedOn, originalStartedOn);
  const endedOnResult = partialNullable(input.endedOn, originalEndedOn);
  const sortOrderResult = partialNullableNumber(
    input.sortOrder,
    optionalNumber(str(formData, 'original_sortOrder')),
  );

  if (competitionTypeResult !== UNSET) {
    body.competition_type_id = competitionTypeResult;
  }
  if (codeResult !== UNSET) {
    body.code = codeResult;
  }
  if (nameResult !== UNSET) {
    body.name = nameResult;
  }
  if (originalNameResult !== UNSET) {
    body.original_name = originalNameResult;
  }
  if (federationResult !== UNSET) {
    body.federation_id = federationResult;
  }
  if (countryResult !== UNSET) {
    body.country_id = countryResult;
  }
  if (competitionPyramidResult !== UNSET) {
    body.competition_pyramid_id = competitionPyramidResult;
  }
  if (primaryCompetitionTierResult !== UNSET) {
    body.primary_competition_tier_id = primaryCompetitionTierResult;
  }
  if (allowedCompetitionTierIdsResult !== UNSET) {
    body.allowed_competition_tier_ids = allowedCompetitionTierIdsResult;
  }
  if (startedOnResult !== UNSET) {
    body.started_on = startedOnResult;
  }
  if (endedOnResult !== UNSET) {
    body.ended_on = endedOnResult;
  }
  if (sortOrderResult !== UNSET) {
    body.sort_order = sortOrderResult;
  }

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { competitionId, body };
}
