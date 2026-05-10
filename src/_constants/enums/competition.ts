/** @format */

import { DEFAULT_LOCALE, type AppLocale } from '@/_i18n/config';

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

export const COMPETITION_STRUCTURE_BRANCH_KINDS = [
  'MALE',
  'FEMALE',
  'MIXED',
] as const;

export const COMPETITION_PYRAMID_BRANCH_KINDS = [
  'UNIFIED',
  'METROPOLITAN',
  'FEDERAL',
] as const;

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
 * Backward-compatible alias for older callers.
 */
export const COMPETITION_BRANCH_KINDS = COMPETITION_STRUCTURE_BRANCH_KINDS;

/**
 * Temporary backward-compatible alias.
 */
export const COMPETITION_SCOPE_KINDS = COMPETITION_TIER_SCOPE_KINDS;

export const COMPETITION_EDITION_STATUSES = [
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'ARCHIVED',
  'HIDDEN',
] as const;

export type CompetitionTypeCategory =
  (typeof COMPETITION_TYPE_CATEGORIES)[number];
export type CompetitionTypeCode = (typeof COMPETITION_TYPE_CODES)[number];
export type ParticipantScope = (typeof PARTICIPANT_SCOPES)[number];
export type CompetitionStructureBranchKind =
  (typeof COMPETITION_STRUCTURE_BRANCH_KINDS)[number];
export type CompetitionPyramidBranchKind =
  (typeof COMPETITION_PYRAMID_BRANCH_KINDS)[number];
export type CompetitionBranchKind = CompetitionStructureBranchKind;
export type CompetitionPyramidScopeKind =
  (typeof COMPETITION_PYRAMID_SCOPE_KINDS)[number];
export type CompetitionTierScopeKind =
  (typeof COMPETITION_TIER_SCOPE_KINDS)[number];
export type CompetitionScopeKind =
  | CompetitionPyramidScopeKind
  | CompetitionTierScopeKind;
export type CompetitionEditionEditorialStatus =
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

export function parseCompetitionStructureBranchKind(
  value: string | null | undefined,
): CompetitionStructureBranchKind | null {
  return parseOptionalEnum(COMPETITION_STRUCTURE_BRANCH_KINDS, value);
}

export function parseCompetitionPyramidBranchKind(
  value: string | null | undefined,
): CompetitionPyramidBranchKind | null {
  return parseOptionalEnum(COMPETITION_PYRAMID_BRANCH_KINDS, value);
}

/**
 * Backward-compatible alias for existing callers.
 */
export function parseCompetitionBranchKind(
  value: string | null | undefined,
): CompetitionBranchKind | null {
  return parseCompetitionStructureBranchKind(value);
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
): CompetitionEditionEditorialStatus | null {
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
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionTypeCategory, string>>
  > = {
    ja: {
      LEAGUE: 'リーグ',
      CUP: 'カップ',
      SUPER_CUP: 'スーパーカップ',
      TOURNAMENT: 'トーナメント',
      FRIENDLY: '親善試合',
      QUALIFICATION: '予選',
    },
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

  return (
    labels[locale][value as CompetitionTypeCategory] ?? formatEnumLabel(value)
  );
}

export function getCompetitionTypeCodeLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionTypeCode, string>>
  > = {
    ja: {
      QUALIFICATION_COMPETITION: '予選大会',
      FRIENDLY_COMPETITION: '親善大会',
      INTERNATIONAL_NATIONAL_TEAM_COMPETITION: '国際代表チーム大会',
      CONTINENTAL_CLUB_COMPETITION: '大陸別クラブ大会',
      SUPER_CUP: 'スーパーカップ',
      DOMESTIC_CUP: '国内カップ',
      LEAGUE: 'リーグ',
    },
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
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<AppLocale, Partial<Record<ParticipantScope, string>>> = {
    ja: {
      CLUB: 'クラブ',
      NATIONAL_TEAM: '代表チーム',
      MIXED: '混合',
    },
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

export function getCompetitionStructureBranchKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionStructureBranchKind, string>>
  > = {
    ja: {
      MALE: '男子',
      FEMALE: '女子',
      MIXED: '混合',
    },
    es: {
      MALE: 'Masculino',
      FEMALE: 'Femenino',
      MIXED: 'Mixto',
    },
    en: {
      MALE: 'Male',
      FEMALE: 'Female',
      MIXED: 'Mixed',
    },
  };

  return (
    labels[locale][value as CompetitionStructureBranchKind] ??
    formatEnumLabel(value)
  );
}

export function getCompetitionPyramidBranchKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionPyramidBranchKind, string>>
  > = {
    ja: {
      UNIFIED: '統一',
      METROPOLITAN: '都市圏',
      FEDERAL: '連邦',
    },
    es: {
      UNIFIED: 'Unificado',
      METROPOLITAN: 'Metropolitano',
      FEDERAL: 'Federal',
    },
    en: {
      UNIFIED: 'Unified',
      METROPOLITAN: 'Metropolitan',
      FEDERAL: 'Federal',
    },
  };

  return (
    labels[locale][value as CompetitionPyramidBranchKind] ??
    formatEnumLabel(value)
  );
}

/**
 * Backward-compatible alias for existing callers.
 */
export function getCompetitionBranchKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  return getCompetitionStructureBranchKindLabel(value, locale);
}

export function getCompetitionPyramidScopeKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionPyramidScopeKind, string>>
  > = {
    ja: {
      NATIONAL: '全国',
      REGIONAL: '地域',
      MIXED: '混合',
    },
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
    labels[locale][value as CompetitionPyramidScopeKind] ??
    formatEnumLabel(value)
  );
}

export function getCompetitionTierScopeKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionTierScopeKind, string>>
  > = {
    ja: {
      NATIONAL: '全国',
      REGIONAL: '地域',
      METROPOLITAN: '都市圏',
      MIXED: '混合',
    },
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

  return (
    labels[locale][value as CompetitionTierScopeKind] ?? formatEnumLabel(value)
  );
}

/**
 * Temporary backward-compatible generic label helper.
 * Prefer getCompetitionPyramidScopeKindLabel or getCompetitionTierScopeKindLabel
 * in new code.
 */
export function getCompetitionScopeKindLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  if (value === 'METROPOLITAN') {
    return getCompetitionTierScopeKindLabel(value, locale);
  }

  return getCompetitionPyramidScopeKindLabel(value, locale);
}

export function getCompetitionEditionStatusLabel(
  value: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  const labels: Record<
    AppLocale,
    Partial<Record<CompetitionEditionEditorialStatus, string>>
  > = {
    ja: {
      DRAFT: '下書き',
      REVIEW: 'レビュー中',
      PUBLISHED: '公開済み',
      ARCHIVED: 'アーカイブ済み',
      HIDDEN: '非表示',
    },
    es: {
      DRAFT: 'Borrador',
      REVIEW: 'En revisión',
      PUBLISHED: 'Publicada',
      ARCHIVED: 'Archivada',
      HIDDEN: 'Oculta',
    },
    en: {
      DRAFT: 'Draft',
      REVIEW: 'Review',
      PUBLISHED: 'Published',
      ARCHIVED: 'Archived',
      HIDDEN: 'Hidden',
    },
  };

  return (
    labels[locale][value as CompetitionEditionEditorialStatus] ??
    formatEnumLabel(value)
  );
}
