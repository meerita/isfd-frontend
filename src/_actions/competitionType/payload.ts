/** @format */

import type { CompetitionTypeActionState } from '@/_types/competitionType';
import {
  parseCompetitionTypeCategory,
  parseParticipantScope,
} from '@/_constants/enums/competition';

const CODE_PATTERN = /^[A-Z0-9_]+$/;

const UNSET = Symbol('unset');

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

function optionalNumber(value: string): number | null {
  if (!value) return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function formError(
  reason: string,
  message: string,
): CompetitionTypeActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function partialRequired(
  value: string,
  original: string,
): string | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  return value === original ? UNSET : value;
}

export function buildCreateCompetitionTypeBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionTypeActionState;
} {
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const competitionTypeCategory = parseCompetitionTypeCategory(
    str(formData, 'competitionTypeCategory'),
  );
  const participantScope = parseParticipantScope(
    str(formData, 'participantScope'),
  );

  if (!code) {
    return {
      error: formError(
        'COMPETITION_TYPE_CODE_REQUIRED',
        'Competition type code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Competition type code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      error: formError(
        'COMPETITION_TYPE_NAME_REQUIRED',
        'Competition type name is required.',
      ),
    };
  }

  if (!competitionTypeCategory) {
    return {
      error: formError(
        'COMPETITION_TYPE_CATEGORY_REQUIRED',
        'Competition type category is required.',
      ),
    };
  }

  if (!participantScope) {
    return {
      error: formError(
        'COMPETITION_TYPE_PARTICIPANT_SCOPE_REQUIRED',
        'Participant scope is required.',
      ),
    };
  }

  const sortOrder = optionalNumber(str(formData, 'sortOrder'));

  return {
    body: {
      code,
      name,
      competition_type_category: competitionTypeCategory,
      participant_scope: participantScope,
      sort_order: sortOrder,
      is_public: bool(formData, 'isActive', true),
    },
  };
}

export function buildUpdateCompetitionTypeBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionTypeActionState;
  competitionTypeId?: string;
} {
  const competitionTypeId = str(formData, 'competitionTypeId');
  if (!competitionTypeId) {
    return {
      error: formError(
        'COMPETITION_TYPE_ID_REQUIRED',
        'Competition type identifier is required.',
      ),
    };
  }

  const name = str(formData, 'name');
  const competitionTypeCategory = parseCompetitionTypeCategory(
    str(formData, 'competitionTypeCategory'),
  );
  const participantScope = parseParticipantScope(
    str(formData, 'participantScope'),
  );

  if (!name) {
    return {
      competitionTypeId,
      error: formError(
        'COMPETITION_TYPE_NAME_REQUIRED',
        'Competition type name is required.',
      ),
    };
  }

  if (!competitionTypeCategory) {
    return {
      competitionTypeId,
      error: formError(
        'COMPETITION_TYPE_CATEGORY_REQUIRED',
        'Competition type category is required.',
      ),
    };
  }

  if (!participantScope) {
    return {
      competitionTypeId,
      error: formError(
        'COMPETITION_TYPE_PARTICIPANT_SCOPE_REQUIRED',
        'Participant scope is required.',
      ),
    };
  }

  const body: Record<string, unknown> = {};
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const categoryResult = partialRequired(
    competitionTypeCategory,
    str(formData, 'original_competitionTypeCategory'),
  );
  const participantScopeResult = partialRequired(
    participantScope,
    str(formData, 'original_participantScope'),
  );
  const sortOrder = optionalNumber(str(formData, 'sortOrder'));
  const originalSortOrder = optionalNumber(str(formData, 'original_sortOrder'));

  if (nameResult !== UNSET) body.name = nameResult;
  if (categoryResult !== UNSET) {
    body.competition_type_category = categoryResult;
  }
  if (participantScopeResult !== UNSET) {
    body.participant_scope = participantScopeResult;
  }

  const sortOrderResult = partialNullableNumber(sortOrder, originalSortOrder);
  if (sortOrderResult !== UNSET) {
    body.sort_order = sortOrderResult;
  }

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_public = isActive;
  }

  return { competitionTypeId, body };
}
