/** @format */

import {
  parseCompetitionPyramidBranchKind,
  parseCompetitionPyramidScopeKind,
  parseCompetitionTierScopeKind,
  parseParticipantScope,
} from '@/_constants/enums/competition';
import type {
  CompetitionPyramidActionState,
  CompetitionTierActionState,
} from '@/_types/competitionStructure';

const UNSET = Symbol('unset');
const CODE_PATTERN = /^[A-Z0-9_]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  return null;
}

function formPyramidError(
  reason: string,
  message: string,
): CompetitionPyramidActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function formTierError(
  reason: string,
  message: string,
): CompetitionTierActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function validateNullableUuid<TState>(
  value: string | null,
  reason: string,
  message: string,
  buildError: (reason: string, message: string) => TState,
): TState | null {
  if (!value || UUID_PATTERN.test(value)) return null;
  return buildError(reason, message);
}

function partialRequired(
  value: string,
  original: string,
): string | typeof UNSET {
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

export function buildCreateCompetitionPyramidBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionPyramidActionState;
} {
  const countryId = str(formData, 'countryId');
  const federationId = optionalString(str(formData, 'federationId'));
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const scopeKind = parseCompetitionPyramidScopeKind(
    str(formData, 'scopeKind'),
  );
  const branchKind = parseCompetitionPyramidBranchKind(str(formData, 'branchKind'));
  const rawValidFrom = str(formData, 'validFrom');
  const validFrom = normalizeDateInput(rawValidFrom);
  const rawValidTo = str(formData, 'validTo');
  const validTo = normalizeDateInput(rawValidTo);

  if (!countryId) {
    return {
      error: formPyramidError(
        'COMPETITION_PYRAMID_COUNTRY_ID_REQUIRED',
        'Competition pyramid country is required.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      countryId,
      'INVALID_COMPETITION_PYRAMID_COUNTRY_ID',
      'Select a valid competition pyramid country.',
      formPyramidError,
    ),
    validateNullableUuid(
      federationId,
      'INVALID_COMPETITION_PYRAMID_FEDERATION_ID',
      'Select a valid competition pyramid federation.',
      formPyramidError,
    ),
  ].find(Boolean);

  if (validationError) {
    return { error: validationError };
  }

  if (!code) {
    return {
      error: formPyramidError(
        'COMPETITION_PYRAMID_CODE_REQUIRED',
        'Competition pyramid code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_CODE_FORMAT',
        'Competition pyramid code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      error: formPyramidError(
        'COMPETITION_PYRAMID_NAME_REQUIRED',
        'Competition pyramid name is required.',
      ),
    };
  }

  if (!scopeKind) {
    return {
      error: formPyramidError(
        'COMPETITION_PYRAMID_SCOPE_KIND_REQUIRED',
        'Competition pyramid scope is required.',
      ),
    };
  }

  if (!branchKind) {
    return {
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_BRANCH_KIND',
        'Select a valid competition pyramid branch kind.',
      ),
    };
  }

  if (!validFrom) {
    return {
      error: formPyramidError(
        'INVALID_REQUEST_DATE',
        'Enter a valid competition pyramid start date.',
      ),
    };
  }

  if (rawValidTo && !validTo) {
    return {
      error: formPyramidError(
        'INVALID_REQUEST_DATE',
        'Enter a valid competition pyramid end date.',
      ),
    };
  }

  if (validTo && validFrom >= validTo) {
    return {
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_VALID_RANGE',
        'Competition pyramid end date must be after the start date.',
      ),
    };
  }

  return {
    body: {
      country_id: countryId,
      federation_id: federationId,
      code,
      name,
      scope_kind: scopeKind,
      branch_kind: branchKind,
      valid_from: validFrom,
      valid_to: validTo ?? null,
      is_active: bool(formData, 'isActive', true),
    },
  };
}

export function buildUpdateCompetitionPyramidBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionPyramidActionState;
  competitionPyramidId?: string;
} {
  const competitionPyramidId = str(formData, 'competitionPyramidId');
  if (!competitionPyramidId) {
    return {
      error: formPyramidError(
        'COMPETITION_PYRAMID_ID_REQUIRED',
        'Competition pyramid identifier is required.',
      ),
    };
  }

  const countryId = str(formData, 'countryId');
  const federationId = optionalString(str(formData, 'federationId'));
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const scopeKind = parseCompetitionPyramidScopeKind(
    str(formData, 'scopeKind'),
  );
  const branchKind = parseCompetitionPyramidBranchKind(str(formData, 'branchKind'));
  const rawValidFrom = str(formData, 'validFrom');
  const validFrom = normalizeDateInput(rawValidFrom);
  const rawValidTo = str(formData, 'validTo');
  const validTo = normalizeDateInput(rawValidTo);

  if (!countryId) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'COMPETITION_PYRAMID_COUNTRY_ID_REQUIRED',
        'Competition pyramid country is required.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      countryId,
      'INVALID_COMPETITION_PYRAMID_COUNTRY_ID',
      'Select a valid competition pyramid country.',
      formPyramidError,
    ),
    validateNullableUuid(
      federationId,
      'INVALID_COMPETITION_PYRAMID_FEDERATION_ID',
      'Select a valid competition pyramid federation.',
      formPyramidError,
    ),
  ].find(Boolean);

  if (validationError) {
    return { competitionPyramidId, error: validationError };
  }

  if (!code) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'COMPETITION_PYRAMID_CODE_REQUIRED',
        'Competition pyramid code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_CODE_FORMAT',
        'Competition pyramid code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'COMPETITION_PYRAMID_NAME_REQUIRED',
        'Competition pyramid name is required.',
      ),
    };
  }

  if (!scopeKind) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'COMPETITION_PYRAMID_SCOPE_KIND_REQUIRED',
        'Competition pyramid scope is required.',
      ),
    };
  }

  if (!branchKind) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_BRANCH_KIND',
        'Select a valid competition pyramid branch kind.',
      ),
    };
  }

  if (!validFrom) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'INVALID_REQUEST_DATE',
        'Enter a valid competition pyramid start date.',
      ),
    };
  }

  if (rawValidTo && !validTo) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'INVALID_REQUEST_DATE',
        'Enter a valid competition pyramid end date.',
      ),
    };
  }

  const originalBranchKind = parseCompetitionPyramidBranchKind(
    str(formData, 'original_branchKind'),
  );
  const originalValidFrom = normalizeDateInput(str(formData, 'original_validFrom'));
  const originalValidTo = normalizeDateInput(str(formData, 'original_validTo'));
  const effectiveValidFrom = validFrom;
  const effectiveValidTo = rawValidTo ? validTo : validTo ?? null;

  if (effectiveValidTo && effectiveValidFrom >= effectiveValidTo) {
    return {
      competitionPyramidId,
      error: formPyramidError(
        'INVALID_COMPETITION_PYRAMID_VALID_RANGE',
        'Competition pyramid end date must be after the start date.',
      ),
    };
  }

  const body: Record<string, unknown> = {};
  const countryResult = partialRequired(
    countryId,
    str(formData, 'original_countryId'),
  );
  const federationResult = partialNullable(
    federationId,
    optionalString(str(formData, 'original_federationId')),
  );
  const codeResult = partialRequired(code, str(formData, 'original_code'));
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const scopeKindResult = partialRequired(
    scopeKind,
    str(formData, 'original_scopeKind'),
  );
  const branchKindResult = partialNullable(branchKind, originalBranchKind);
  const validFromResult = partialRequired(
    validFrom,
    originalValidFrom ?? '',
  );
  const validToResult = partialNullable(validTo, originalValidTo);

  if (countryResult !== UNSET) body.country_id = countryResult;
  if (federationResult !== UNSET) body.federation_id = federationResult;
  if (codeResult !== UNSET) body.code = codeResult;
  if (nameResult !== UNSET) body.name = nameResult;
  if (scopeKindResult !== UNSET) body.scope_kind = scopeKindResult;
  if (branchKindResult !== UNSET) body.branch_kind = branchKindResult;
  if (validFromResult !== UNSET) body.valid_from = validFromResult;
  if (validToResult !== UNSET) body.valid_to = validToResult;

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { competitionPyramidId, body };
}

export function buildCreateCompetitionTierBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionTierActionState;
} {
  const competitionPyramidId = str(formData, 'competitionPyramidId');
  const parentTierId = optionalString(str(formData, 'parentTierId'));
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const shortName = optionalString(str(formData, 'shortName'));
  const levelOrder = optionalNumber(str(formData, 'levelOrder'));
  const scopeKind = parseCompetitionTierScopeKind(str(formData, 'scopeKind'));
  const participantScope = parseParticipantScope(
    str(formData, 'participantScope'),
  );

  if (!competitionPyramidId) {
    return {
      error: formTierError(
        'COMPETITION_TIER_COMPETITION_PYRAMID_ID_REQUIRED',
        'Competition tier pyramid is required.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      competitionPyramidId,
      'INVALID_COMPETITION_TIER_COMPETITION_PYRAMID_ID',
      'Select a valid competition pyramid for this tier.',
      formTierError,
    ),
    validateNullableUuid(
      parentTierId,
      'INVALID_COMPETITION_TIER_PARENT_TIER_ID',
      'Select a valid parent competition tier.',
      formTierError,
    ),
  ].find(Boolean);

  if (validationError) {
    return { error: validationError };
  }

  if (!code) {
    return {
      error: formTierError(
        'COMPETITION_TIER_CODE_REQUIRED',
        'Competition tier code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      error: formTierError(
        'FORM_VALIDATION_ERROR',
        'Competition tier code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      error: formTierError(
        'COMPETITION_TIER_NAME_REQUIRED',
        'Competition tier name is required.',
      ),
    };
  }

  if (!scopeKind) {
    return {
      error: formTierError(
        'COMPETITION_TIER_SCOPE_KIND_REQUIRED',
        'Competition tier scope is required.',
      ),
    };
  }

  if (!participantScope) {
    return {
      error: formTierError(
        'COMPETITION_TIER_PARTICIPANT_SCOPE_REQUIRED',
        'Competition tier participant scope is required.',
      ),
    };
  }

  return {
    body: {
      competition_pyramid_id: competitionPyramidId,
      parent_tier_id: parentTierId,
      code,
      name,
      short_name: shortName,
      level_order: levelOrder,
      scope_kind: scopeKind,
      participant_scope: participantScope,
      is_active: bool(formData, 'isActive', true),
    },
  };
}

export function buildUpdateCompetitionTierBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CompetitionTierActionState;
  competitionTierId?: string;
} {
  const competitionTierId = str(formData, 'competitionTierId');
  if (!competitionTierId) {
    return {
      error: formTierError(
        'COMPETITION_TIER_ID_REQUIRED',
        'Competition tier identifier is required.',
      ),
    };
  }

  const competitionPyramidId = str(formData, 'competitionPyramidId');
  const parentTierId = optionalString(str(formData, 'parentTierId'));
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const shortName = optionalString(str(formData, 'shortName'));
  const levelOrder = optionalNumber(str(formData, 'levelOrder'));
  const scopeKind = parseCompetitionTierScopeKind(str(formData, 'scopeKind'));
  const participantScope = parseParticipantScope(
    str(formData, 'participantScope'),
  );

  if (!competitionPyramidId) {
    return {
      competitionTierId,
      error: formTierError(
        'COMPETITION_TIER_COMPETITION_PYRAMID_ID_REQUIRED',
        'Competition tier pyramid is required.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      competitionPyramidId,
      'INVALID_COMPETITION_TIER_COMPETITION_PYRAMID_ID',
      'Select a valid competition pyramid for this tier.',
      formTierError,
    ),
    validateNullableUuid(
      parentTierId,
      'INVALID_COMPETITION_TIER_PARENT_TIER_ID',
      'Select a valid parent competition tier.',
      formTierError,
    ),
  ].find(Boolean);

  if (validationError) {
    return { competitionTierId, error: validationError };
  }

  if (!code) {
    return {
      competitionTierId,
      error: formTierError(
        'COMPETITION_TIER_CODE_REQUIRED',
        'Competition tier code is required.',
      ),
    };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      competitionTierId,
      error: formTierError(
        'FORM_VALIDATION_ERROR',
        'Competition tier code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return {
      competitionTierId,
      error: formTierError(
        'COMPETITION_TIER_NAME_REQUIRED',
        'Competition tier name is required.',
      ),
    };
  }

  if (!scopeKind) {
    return {
      competitionTierId,
      error: formTierError(
        'COMPETITION_TIER_SCOPE_KIND_REQUIRED',
        'Competition tier scope is required.',
      ),
    };
  }

  if (!participantScope) {
    return {
      competitionTierId,
      error: formTierError(
        'COMPETITION_TIER_PARTICIPANT_SCOPE_REQUIRED',
        'Competition tier participant scope is required.',
      ),
    };
  }

  const body: Record<string, unknown> = {};
  const competitionPyramidResult = partialRequired(
    competitionPyramidId,
    str(formData, 'original_competitionPyramidId'),
  );
  const parentTierResult = partialNullable(
    parentTierId,
    optionalString(str(formData, 'original_parentTierId')),
  );
  const codeResult = partialRequired(code, str(formData, 'original_code'));
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const shortNameResult = partialNullable(
    shortName,
    optionalString(str(formData, 'original_shortName')),
  );
  const levelOrderResult = partialNullableNumber(
    levelOrder,
    optionalNumber(str(formData, 'original_levelOrder')),
  );
  const scopeKindResult = partialRequired(
    scopeKind,
    str(formData, 'original_scopeKind'),
  );
  const participantScopeResult = partialRequired(
    participantScope,
    str(formData, 'original_participantScope'),
  );

  if (competitionPyramidResult !== UNSET) {
    body.competition_pyramid_id = competitionPyramidResult;
  }
  if (parentTierResult !== UNSET) body.parent_tier_id = parentTierResult;
  if (codeResult !== UNSET) body.code = codeResult;
  if (nameResult !== UNSET) body.name = nameResult;
  if (shortNameResult !== UNSET) body.short_name = shortNameResult;
  if (levelOrderResult !== UNSET) body.level_order = levelOrderResult;
  if (scopeKindResult !== UNSET) body.scope_kind = scopeKindResult;
  if (participantScopeResult !== UNSET) {
    body.participant_scope = participantScopeResult;
  }

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { competitionTierId, body };
}
