/** @format */

import type { AppLocale } from '@/_i18n/config';

import { parseOptionalEnum } from './helpers';

export const COMPETITION_TYPE_CATEGORIES = [
  'LEAGUE',
  'CUP',
  'SUPER_CUP',
  'TOURNAMENT',
  'FRIENDLY',
  'QUALIFICATION',
] as const;

export const COMPETITION_TYPE_CODES = [
  'QUALIFICATION_COMPETITION',
  'FRIENDLY_COMPETITION',
  'INTERNATIONAL_NATIONAL_TEAM_COMPETITION',
  'CONTINENTAL_CLUB_COMPETITION',
  'SUPER_CUP',
  'DOMESTIC_CUP',
  'LEAGUE',
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
export type CompetitionTypeCode = (typeof COMPETITION_TYPE_CODES)[number];
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

export function getCompetitionTypeCategoryLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<AppLocale, Partial<Record<CompetitionTypeCategory, string>>> = {
    es: {
      LEAGUE: 'Liga',
      CUP: 'Copa',
      SUPER_CUP: 'Supercopa',
      TOURNAMENT: 'Torneo',
      FRIENDLY: 'Amistoso',
      QUALIFICATION: 'Clasificación',
    },
    en: {
      LEAGUE: 'League',
      CUP: 'Cup',
      SUPER_CUP: 'Super Cup',
      TOURNAMENT: 'Tournament',
      FRIENDLY: 'Friendly',
      QUALIFICATION: 'Qualification',
    },
  };

  return labels[locale][value as CompetitionTypeCategory] ?? formatEnumLabel(value);
}

export function getCompetitionTypeCodeLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<AppLocale, Partial<Record<CompetitionTypeCode, string>>> = {
    es: {
      QUALIFICATION_COMPETITION: 'Competición de clasificación',
      FRIENDLY_COMPETITION: 'Competición amistosa',
      INTERNATIONAL_NATIONAL_TEAM_COMPETITION:
        'Competición internacional de selecciones',
      CONTINENTAL_CLUB_COMPETITION: 'Competición continental de clubes',
      SUPER_CUP: 'Supercopa',
      DOMESTIC_CUP: 'Copa nacional',
      LEAGUE: 'Liga',
    },
    en: {
      QUALIFICATION_COMPETITION: 'Qualification competition',
      FRIENDLY_COMPETITION: 'Friendly competition',
      INTERNATIONAL_NATIONAL_TEAM_COMPETITION:
        'International national team competition',
      CONTINENTAL_CLUB_COMPETITION: 'Continental club competition',
      SUPER_CUP: 'Super Cup',
      DOMESTIC_CUP: 'Domestic cup',
      LEAGUE: 'League',
    },
  };

  return labels[locale][value as CompetitionTypeCode] ?? formatEnumLabel(value);
}

export function getParticipantScopeLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<AppLocale, Partial<Record<ParticipantScope, string>>> = {
    es: {
      CLUB: 'Club',
      NATIONAL_TEAM: 'Selección nacional',
      MIXED: 'Mixto',
    },
    en: {
      CLUB: 'Club',
      NATIONAL_TEAM: 'National team',
      MIXED: 'Mixed',
    },
  };

  return labels[locale][value as ParticipantScope] ?? formatEnumLabel(value);
}

export function getCompetitionPyramidScopeKindLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionPyramidScopeKind, string>>
  > = {
    es: {
      NATIONAL: 'Nacional',
      REGIONAL: 'Regional',
      MIXED: 'Mixto',
    },
    en: {
      NATIONAL: 'National',
      REGIONAL: 'Regional',
      MIXED: 'Mixed',
    },
  };

  return (
    labels[locale][value as CompetitionPyramidScopeKind] ?? formatEnumLabel(value)
  );
}

export function getCompetitionTierScopeKindLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<AppLocale, Partial<Record<CompetitionTierScopeKind, string>>> = {
    es: {
      NATIONAL: 'Nacional',
      REGIONAL: 'Regional',
      METROPOLITAN: 'Metropolitano',
      MIXED: 'Mixto',
    },
    en: {
      NATIONAL: 'National',
      REGIONAL: 'Regional',
      METROPOLITAN: 'Metropolitan',
      MIXED: 'Mixed',
    },
  };

  return labels[locale][value as CompetitionTierScopeKind] ?? formatEnumLabel(value);
}

/**
 * Temporary backward-compatible generic label helper.
 * Prefer getCompetitionPyramidScopeKindLabel or getCompetitionTierScopeKindLabel
 * in new code.
 */
export function getCompetitionScopeKindLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  if (value === 'METROPOLITAN') {
    return getCompetitionTierScopeKindLabel(value, locale);
  }

  return getCompetitionPyramidScopeKindLabel(value, locale);
}

export function getCompetitionEditionStatusLabel(
  value: string,
  locale: AppLocale = 'es',
): string {
  const labels: Record<AppLocale, Partial<Record<CompetitionEditionStatus, string>>> = {
    es: {
      DRAFT: 'Borrador',
      SCHEDULED: 'Programada',
      ACTIVE: 'Activa',
      FINISHED: 'Finalizada',
      ARCHIVED: 'Archivada',
    },
    en: {
      DRAFT: 'Draft',
      SCHEDULED: 'Scheduled',
      ACTIVE: 'Active',
      FINISHED: 'Finished',
      ARCHIVED: 'Archived',
    },
  };

  return labels[locale][value as CompetitionEditionStatus] ?? formatEnumLabel(value);
}
