/** @format */

import type { CompetitionEditionActionState } from '@/_types/competitionEdition';
import { parseCompetitionEditionStatus } from '@/_constants/enums/competition';
import { isUuid } from '@/_helpers/uuid';

const UNSET = Symbol('unset');
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
  if (!value || isUuid(value)) return null;
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

function validateEditionRelations(
  competitionId: string | null,
  competitionPyramidId: string | null,
  primaryCompetitionTierId: string | null,
): CompetitionEditionActionState | null {
  const relationError = [
    validateNullableUuid(
      competitionId,
      'COMPETITION_EDITION_INVALID_COMPETITION_ID',
      'Select a valid competition.',
    ),
    validateNullableUuid(
      competitionPyramidId,
      'FORM_VALIDATION_ERROR',
      'Select a valid competition pyramid.',
    ),
    validateNullableUuid(
      primaryCompetitionTierId,
      'FORM_VALIDATION_ERROR',
      'Select a valid primary competition tier.',
    ),
  ].find(Boolean);

  if (relationError) {
    return relationError;
  }

  if (!competitionId) {
    return formError(
      'COMPETITION_EDITION_INVALID_COMPETITION_ID',
      'Competition is required.',
    );
  }

  if (primaryCompetitionTierId && !competitionPyramidId) {
    return formError(
      'FORM_VALIDATION_ERROR',
      'Primary competition tier requires a competition pyramid.',
    );
  }

  return null;
}

export function buildCreateCompetitionEditionBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: CompetitionEditionActionState } {
  const competitionId = optionalString(str(formData, 'competitionId'));
  const editionLabel = str(formData, 'editionLabel');
  const competitionPyramidId = optionalString(str(formData, 'competitionPyramidId'));
  const primaryCompetitionTierId = optionalString(
    str(formData, 'primaryCompetitionTierId'),
  );

  const validationError = validateEditionRelations(
    competitionId,
    competitionPyramidId,
    primaryCompetitionTierId,
  );
  if (validationError) return { error: validationError };

  if (!editionLabel) {
    return {
      error: formError(
        'COMPETITION_EDITION_NAME_REQUIRED',
        'Competition edition label is required.',
      ),
    };
  }

  return {
    body: {
      edition_label: editionLabel,
      competition_id: competitionId,
      competition_pyramid_id: competitionPyramidId,
      primary_competition_tier_id: primaryCompetitionTierId,
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

  const competitionId = str(formData, 'competitionId');
  const competitionPyramidId = optionalString(str(formData, 'competitionPyramidId'));
  const primaryCompetitionTierId = optionalString(
    str(formData, 'primaryCompetitionTierId'),
  );
  const editionLabel = optionalString(str(formData, 'editionLabel'));
  const shortName = optionalString(str(formData, 'shortName'));
  const year = optionalNumber(str(formData, 'year'));
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const startedOn = normalizeDateInput(rawStartedOn);
  const endedOn = normalizeDateInput(rawEndedOn);
  const editorialStatus = parseCompetitionEditionStatus(
    str(formData, 'editorialStatus'),
  );
  const sortOrder = optionalNumber(str(formData, 'sortOrder'));

  const validationError = validateEditionRelations(
    competitionId,
    competitionPyramidId,
    primaryCompetitionTierId,
  );
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
  const competitionResult = partialRequired(
    competitionId,
    str(formData, 'original_competitionId'),
  );
  const competitionPyramidResult = partialNullable(
    competitionPyramidId,
    optionalString(str(formData, 'original_competitionPyramidId')),
  );
  const primaryCompetitionTierResult = partialNullable(
    primaryCompetitionTierId,
    optionalString(str(formData, 'original_primaryCompetitionTierId')),
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
  const originalEditorialStatus = parseCompetitionEditionStatus(
    str(formData, 'original_editorialStatus'),
  );
  const sortOrderResult = partialNullableNumber(
    sortOrder,
    optionalNumber(str(formData, 'original_sortOrder')),
  );

  if (competitionResult !== UNSET) body.competition_id = competitionResult;
  if (competitionPyramidResult !== UNSET) {
    body.competition_pyramid_id = competitionPyramidResult;
  }
  if (primaryCompetitionTierResult !== UNSET) {
    body.primary_competition_tier_id = primaryCompetitionTierResult;
  }
  if (editionLabelResult !== UNSET) body.edition_label = editionLabelResult;
  if (shortNameResult !== UNSET) body.short_name = shortNameResult;
  if (yearResult !== UNSET) body.year = yearResult;
  if (startedOnResult !== UNSET) body.started_on = startedOnResult;
  if (endedOnResult !== UNSET) body.ended_on = endedOnResult;
  if (editorialStatus && editorialStatus !== originalEditorialStatus) {
    body.editorial_status = editorialStatus;
  }
  if (sortOrderResult !== UNSET) body.sort_order = sortOrderResult;

  const isPublic = bool(formData, 'isPublic', false);
  const originalIsPublic = bool(formData, 'original_isPublic', false);
  if (isPublic !== originalIsPublic) {
    body.is_public = isPublic;
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
