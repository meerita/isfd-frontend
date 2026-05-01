/** @format */

import type { CompetitionActionState } from '@/_types/competition';

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
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (DATE_PATTERN.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
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

export function buildCreateCompetitionBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: CompetitionActionState } {
  const competitionTypeId = str(formData, 'competitionTypeId');
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const federationId = optionalString(str(formData, 'federationId'));
  const countryId = optionalString(str(formData, 'countryId'));
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const startedOn = normalizeDateInput(rawStartedOn);
  const endedOn = normalizeDateInput(rawEndedOn);
  const sortOrder = optionalNumber(str(formData, 'sortOrder'));

  if (!competitionTypeId) {
    return {
      error: formError(
        'COMPETITION_COMPETITION_TYPE_ID_REQUIRED',
        'Competition type is required.',
      ),
    };
  }

  if (!UUID_PATTERN.test(competitionTypeId)) {
    return {
      error: formError(
        'COMPETITION_INVALID_COMPETITION_TYPE_ID',
        'Select a valid competition type.',
      ),
    };
  }

  if (!code) {
    return { error: formError('COMPETITION_CODE_REQUIRED', 'Competition code is required.') };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Competition code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return { error: formError('COMPETITION_NAME_REQUIRED', 'Competition name is required.') };
  }

  const validationError = [
    validateNullableUuid(
      federationId,
      'COMPETITION_INVALID_FEDERATION_ID',
      'Select a valid federation.',
    ),
    validateNullableUuid(
      countryId,
      'COMPETITION_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
  ].find(Boolean);

  if (validationError) {
    return { error: validationError };
  }

  if (rawStartedOn && !startedOn) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Start date must use YYYY-MM-DD.',
      ),
    };
  }

  if (rawEndedOn && !endedOn) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'End date must use YYYY-MM-DD.',
      ),
    };
  }

  if (startedOn && endedOn && endedOn < startedOn) {
    return {
      error: formError(
        'COMPETITION_INVALID_DATE_RANGE',
        'End date cannot be before the start date.',
      ),
    };
  }

  return {
    body: {
      competition_type_id: competitionTypeId,
      federation_id: federationId,
      country_id: countryId,
      code,
      name,
      started_on: startedOn,
      ended_on: endedOn,
      sort_order: sortOrder,
      is_active: bool(formData, 'isActive', true),
    },
  };
}

export function buildUpdateCompetitionBody(
  formData: FormData,
): {
  body?: Record<string, unknown>;
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

  const competitionTypeId = str(formData, 'competitionTypeId');
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const federationId = optionalString(str(formData, 'federationId'));
  const countryId = optionalString(str(formData, 'countryId'));
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const startedOn = normalizeDateInput(rawStartedOn);
  const endedOn = normalizeDateInput(rawEndedOn);
  const sortOrder = optionalNumber(str(formData, 'sortOrder'));
  const originalStartedOn = optionalString(str(formData, 'original_startedOn'));
  const originalEndedOn = optionalString(str(formData, 'original_endedOn'));

  if (!competitionTypeId) {
    return {
      competitionId,
      error: formError(
        'COMPETITION_COMPETITION_TYPE_ID_REQUIRED',
        'Competition type is required.',
      ),
    };
  }

  if (!UUID_PATTERN.test(competitionTypeId)) {
    return {
      competitionId,
      error: formError(
        'COMPETITION_INVALID_COMPETITION_TYPE_ID',
        'Select a valid competition type.',
      ),
    };
  }

  if (!code) {
    return {
      competitionId,
      error: formError(
        'COMPETITION_CODE_REQUIRED',
        'Competition code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      competitionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Competition code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      competitionId,
      error: formError(
        'COMPETITION_NAME_REQUIRED',
        'Competition name is required.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      federationId,
      'COMPETITION_INVALID_FEDERATION_ID',
      'Select a valid federation.',
    ),
    validateNullableUuid(
      countryId,
      'COMPETITION_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
  ].find(Boolean);

  if (validationError) {
    return { competitionId, error: validationError };
  }

  if (rawStartedOn && !startedOn) {
    return {
      competitionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Start date must use YYYY-MM-DD.',
      ),
    };
  }

  if (rawEndedOn && !endedOn) {
    return {
      competitionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'End date must use YYYY-MM-DD.',
      ),
    };
  }

  const effectiveStartedOn = startedOn ?? originalStartedOn;
  const effectiveEndedOn = endedOn ?? originalEndedOn;
  if (
    effectiveStartedOn &&
    effectiveEndedOn &&
    effectiveEndedOn < effectiveStartedOn
  ) {
    return {
      competitionId,
      error: formError(
        'COMPETITION_INVALID_DATE_RANGE',
        'End date cannot be before the start date.',
      ),
    };
  }

  const body: Record<string, unknown> = {};
  const competitionTypeResult = partialRequired(
    competitionTypeId,
    str(formData, 'original_competitionTypeId'),
  );
  const codeResult = partialRequired(code, str(formData, 'original_code'));
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const federationResult = partialNullable(
    federationId,
    optionalString(str(formData, 'original_federationId')),
  );
  const countryResult = partialNullable(
    countryId,
    optionalString(str(formData, 'original_countryId')),
  );
  const startedOnResult = partialNullable(startedOn, originalStartedOn);
  const endedOnResult = partialNullable(endedOn, originalEndedOn);
  const sortOrderResult = partialNullableNumber(
    sortOrder,
    optionalNumber(str(formData, 'original_sortOrder')),
  );

  if (competitionTypeResult !== UNSET) {
    body.competition_type_id = competitionTypeResult;
  }
  if (codeResult !== UNSET) body.code = codeResult;
  if (nameResult !== UNSET) body.name = nameResult;
  if (federationResult !== UNSET) body.federation_id = federationResult;
  if (countryResult !== UNSET) body.country_id = countryResult;
  if (startedOnResult !== UNSET) body.started_on = startedOnResult;
  if (endedOnResult !== UNSET) body.ended_on = endedOnResult;
  if (sortOrderResult !== UNSET) body.sort_order = sortOrderResult;

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { competitionId, body };
}
