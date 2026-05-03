/** @format */

import { parseOptionalEnum } from './helpers';

export const COMPETITION_TYPE_CATEGORIES = [
  'LEAGUE',
  'CUP',
  'SUPER_CUP',
  'TOURNAMENT',
  'FRIENDLY',
  'QUALIFICATION',
] as const;

export const PARTICIPANT_SCOPES = ['CLUB', 'NATIONAL_TEAM', 'MIXED'] as const;

export const COMPETITION_PYRAMID_SCOPE_KINDS = [
  'NATIONAL',
  'REGIONAL',
  'MIXED',
] as const;

export const COMPETITION_TIER_SCOPE_KINDS = [
  'NATIONAL',
  'REGIONAL',
  'METROPOLITAN',
  'MIXED',
] as const;

/**
 * Temporary backward-compatible alias.
 * Existing callers that still use the generic competition structure scope
 * will continue to work while the codebase is migrated to the explicit
 * pyramid/tier separation.
 */
export const COMPETITION_SCOPE_KINDS = COMPETITION_TIER_SCOPE_KINDS;

export const COMPETITION_EDITION_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'FINISHED',
  'ARCHIVED',
] as const;

export type CompetitionTypeCategory =
  (typeof COMPETITION_TYPE_CATEGORIES)[number];
export type ParticipantScope = (typeof PARTICIPANT_SCOPES)[number];
export type CompetitionPyramidScopeKind =
  (typeof COMPETITION_PYRAMID_SCOPE_KINDS)[number];
export type CompetitionTierScopeKind =
  (typeof COMPETITION_TIER_SCOPE_KINDS)[number];
export type CompetitionScopeKind =
  | CompetitionPyramidScopeKind
  | CompetitionTierScopeKind;
export type CompetitionEditionStatus =
  (typeof COMPETITION_EDITION_STATUSES)[number];

export function parseCompetitionTypeCategory(
  value: string | null | undefined,
): CompetitionTypeCategory | null {
  return parseOptionalEnum(COMPETITION_TYPE_CATEGORIES, value);
}

export function parseParticipantScope(
  value: string | null | undefined,
): ParticipantScope | null {
  return parseOptionalEnum(PARTICIPANT_SCOPES, value);
}

export function parseCompetitionPyramidScopeKind(
  value: string | null | undefined,
): CompetitionPyramidScopeKind | null {
  return parseOptionalEnum(COMPETITION_PYRAMID_SCOPE_KINDS, value);
}

export function parseCompetitionTierScopeKind(
  value: string | null | undefined,
): CompetitionTierScopeKind | null {
  return parseOptionalEnum(COMPETITION_TIER_SCOPE_KINDS, value);
}

/**
 * Temporary backward-compatible generic parser.
 * Prefer parseCompetitionPyramidScopeKind or parseCompetitionTierScopeKind
 * in new code.
 */
export function parseCompetitionScopeKind(
  value: string | null | undefined,
): CompetitionScopeKind | null {
  return (
    parseCompetitionTierScopeKind(value) ??
    parseCompetitionPyramidScopeKind(value)
  );
}

export function parseCompetitionEditionStatus(
  value: string | null | undefined,
): CompetitionEditionStatus | null {
  return parseOptionalEnum(COMPETITION_EDITION_STATUSES, value);
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getCompetitionTypeCategoryLabel(value: string): string {
  if (value === 'SUPER_CUP') {
    return 'Super Cup';
  }

  return formatEnumLabel(value);
}

export function getParticipantScopeLabel(value: string): string {
  if (value === 'NATIONAL_TEAM') {
    return 'National team';
  }

  return formatEnumLabel(value);
}

export function getCompetitionPyramidScopeKindLabel(value: string): string {
  return formatEnumLabel(value);
}

export function getCompetitionTierScopeKindLabel(value: string): string {
  return formatEnumLabel(value);
}

/**
 * Temporary backward-compatible generic label helper.
 * Prefer getCompetitionPyramidScopeKindLabel or getCompetitionTierScopeKindLabel
 * in new code.
 */
export function getCompetitionScopeKindLabel(value: string): string {
  if (value === 'METROPOLITAN') {
    return getCompetitionTierScopeKindLabel(value);
  }

  return getCompetitionPyramidScopeKindLabel(value);
}

export function getCompetitionEditionStatusLabel(value: string): string {
  return formatEnumLabel(value);
}
