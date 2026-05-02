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
export const COMPETITION_SCOPE_KINDS = ['MEN', 'WOMEN', 'MIXED'] as const;

export const COMPETITION_EDITION_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'FINISHED',
  'ARCHIVED',
] as const;

export type CompetitionTypeCategory = (typeof COMPETITION_TYPE_CATEGORIES)[number];
export type ParticipantScope = (typeof PARTICIPANT_SCOPES)[number];
export type CompetitionScopeKind = (typeof COMPETITION_SCOPE_KINDS)[number];
export type CompetitionEditionStatus = (typeof COMPETITION_EDITION_STATUSES)[number];

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

export function parseCompetitionScopeKind(
  value: string | null | undefined,
): CompetitionScopeKind | null {
  return parseOptionalEnum(COMPETITION_SCOPE_KINDS, value);
}

export function parseCompetitionEditionStatus(
  value: string | null | undefined,
): CompetitionEditionStatus | null {
  return parseOptionalEnum(COMPETITION_EDITION_STATUSES, value);
}

export function getCompetitionTypeCategoryLabel(
  value: CompetitionTypeCategory | string,
): string {
  switch (value) {
    case 'SUPER_CUP':
      return 'Super Cup';
    default:
      return value
        .toLowerCase()
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
}

export function getParticipantScopeLabel(value: ParticipantScope | string): string {
  switch (value) {
    case 'NATIONAL_TEAM':
      return 'National team';
    default:
      return value
        .toLowerCase()
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
}

export function getCompetitionScopeKindLabel(
  value: CompetitionScopeKind | string,
): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function getCompetitionEditionStatusLabel(
  value: CompetitionEditionStatus | string,
): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
