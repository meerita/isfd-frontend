/** @format */

import type { CompetitionEditionActionState } from '@/_types/competitionEdition';
import { parseCompetitionEditionStatus } from '@/_constants/enums/competition';

const UNSET = Symbol('unset');
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CODE_PATTERN = /^[A-Z0-9_]+$/;

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

function formError(
  reason: string,
  message: string,
): CompetitionEditionActionState {
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
): CompetitionEditionActionState | null {
  if (!value || UUID_PATTERN.test(value)) return null;
  return formError(reason, message);
}

function partialNullable(
  value: string | null,
  original: string | null,
): string | null | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialRequired(value: string, original: string): string | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  return value === original ? UNSET : value;
}

export function buildCreateCompetitionEditionBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: CompetitionEditionActionState } {
  const name = str(formData, 'name');
  const seasonId = optionalString(str(formData, 'seasonId'));

  if (!name) {
    return {
      error: formError(
        'COMPETITION_EDITION_NAME_REQUIRED',
        'Competition edition name is required.',
      ),
    };
  }

  const validationError = validateNullableUuid(
    seasonId,
    'COMPETITION_EDITION_INVALID_SEASON_ID',
    'Select a valid season.',
  );
  if (validationError) return { error: validationError };

  return {
    body: {
      name,
      season_id: seasonId,
    },
  };
}

export function buildUpdateCompetitionEditionBody(
  formData: FormData,
): {
  body?: Record<string, unknown>;
  error?: CompetitionEditionActionState;
  competitionEditionId?: string;
} {
  const competitionEditionId = str(formData, 'competitionEditionId');
  if (!competitionEditionId) {
    return {
      error: formError(
        'COMPETITION_EDITION_ID_REQUIRED',
        'Competition edition identifier is required.',
      ),
    };
  }

  const name = str(formData, 'name');
  if (!name) {
    return {
      competitionEditionId,
      error: formError(
        'COMPETITION_EDITION_NAME_REQUIRED',
        'Competition edition name is required.',
      ),
    };
  }

  const competitionId = optionalString(str(formData, 'competitionId'));
  const seasonId = optionalString(str(formData, 'seasonId'));
  const editionLabel = optionalString(str(formData, 'editionLabel'));
  const shortName = optionalString(str(formData, 'shortName'));
  const year = optionalNumber(str(formData, 'year'));
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const startedOn = normalizeDateInput(rawStartedOn);
  const endedOn = normalizeDateInput(rawEndedOn);
  const status = parseCompetitionEditionStatus(str(formData, 'status'));
  const sortOrder = optionalNumber(str(formData, 'sortOrder'));

  const validationError = [
    validateNullableUuid(
      competitionId,
      'COMPETITION_EDITION_INVALID_COMPETITION_ID',
      'Select a valid competition.',
    ),
    validateNullableUuid(
      seasonId,
      'COMPETITION_EDITION_INVALID_SEASON_ID',
      'Select a valid season.',
    ),
  ].find(Boolean);

  if (validationError) {
    return { competitionEditionId, error: validationError };
  }

  if (rawStartedOn && !startedOn) {
    return {
      competitionEditionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Start date must use YYYY-MM-DD.',
      ),
    };
  }

  if (rawEndedOn && !endedOn) {
    return {
      competitionEditionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'End date must use YYYY-MM-DD.',
      ),
    };
  }

  const originalStartedOn = optionalString(str(formData, 'original_startedOn'));
  const originalEndedOn = optionalString(str(formData, 'original_endedOn'));
  const effectiveStartedOn = startedOn ?? originalStartedOn;
  const effectiveEndedOn = endedOn ?? originalEndedOn;

  if (
    effectiveStartedOn &&
    effectiveEndedOn &&
    effectiveEndedOn < effectiveStartedOn
  ) {
    return {
      competitionEditionId,
      error: formError(
        'COMPETITION_EDITION_ENDED_ON_BEFORE_STARTED_ON',
        'End date cannot be before the start date.',
      ),
    };
  }

  const body: Record<string, unknown> = {};
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const competitionResult = partialNullable(
    competitionId,
    optionalString(str(formData, 'original_competitionId')),
  );
  const seasonResult = partialNullable(
    seasonId,
    optionalString(str(formData, 'original_seasonId')),
  );
  const editionLabelResult = partialNullable(
    editionLabel,
    optionalString(str(formData, 'original_editionLabel')),
  );
  const shortNameResult = partialNullable(
    shortName,
    optionalString(str(formData, 'original_shortName')),
  );
  const yearResult = partialNullableNumber(
    year,
    optionalNumber(str(formData, 'original_year')),
  );
  const startedOnResult = partialNullable(startedOn, originalStartedOn);
  const endedOnResult = partialNullable(endedOn, originalEndedOn);
  const originalStatus = parseCompetitionEditionStatus(str(formData, 'original_status'));
  const sortOrderResult = partialNullableNumber(
    sortOrder,
    optionalNumber(str(formData, 'original_sortOrder')),
  );

  if (nameResult !== UNSET) body.name = nameResult;
  if (competitionResult !== UNSET) body.competition_id = competitionResult;
  if (seasonResult !== UNSET) body.season_id = seasonResult;
  if (editionLabelResult !== UNSET) body.edition_label = editionLabelResult;
  if (shortNameResult !== UNSET) body.short_name = shortNameResult;
  if (yearResult !== UNSET) body.year = yearResult;
  if (startedOnResult !== UNSET) body.started_on = startedOnResult;
  if (endedOnResult !== UNSET) body.ended_on = endedOnResult;
  if (status && status !== originalStatus) body.status = status;
  if (sortOrderResult !== UNSET) body.sort_order = sortOrderResult;

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { competitionEditionId, body };
}

export function buildUpdateCompetitionEditionCodeBody(
  formData: FormData,
): {
  body?: Record<string, unknown>;
  error?: CompetitionEditionActionState;
  competitionEditionId?: string;
} {
  const competitionEditionId = str(formData, 'competitionEditionId');
  if (!competitionEditionId) {
    return {
      error: formError(
        'COMPETITION_EDITION_ID_REQUIRED',
        'Competition edition identifier is required.',
      ),
    };
  }

  const code = str(formData, 'code');
  if (!code) {
    return {
      competitionEditionId,
      error: formError(
        'COMPETITION_EDITION_CODE_REQUIRED',
        'Competition edition code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      competitionEditionId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Competition edition code must use A-Z, 0-9, and _.',
      ),
    };
  }

  return {
    competitionEditionId,
    body: { code },
  };
}
