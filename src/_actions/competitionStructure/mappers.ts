/** @format */

import {
  parseCompetitionPyramidBranchKind,
  parseCompetitionPyramidScopeKind,
  parseCompetitionStructureBranchKind,
  parseCompetitionTierScopeKind,
  parseParticipantScope,
} from '@/_constants/enums/competition';
import type {
  CompetitionPyramid,
  CompetitionPyramidListMetadata,
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
  CompetitionTier,
  CompetitionTierListMetadata,
} from '@/_types/competitionStructure';

type Raw = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function toBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  return false;
}

function toNumberValue(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function toDateOnlyValue(value: unknown): string {
  const raw = toNullableString(value);
  if (!raw) return '';

  if (DATE_ONLY_PATTERN.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toISOString().slice(0, 10);
}

function toNullableDateOnlyValue(value: unknown): string | null {
  const raw = toNullableString(value);
  if (!raw) return null;

  if (DATE_ONLY_PATTERN.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toISOString().slice(0, 10);
}

export function mapCompetitionPyramid(raw: Raw): CompetitionPyramid {
  return {
    id: toStringValue(raw.id),
    versionId: toNullableString(raw.version_id ?? raw.versionId),
    countryId: toStringValue(raw.country_id ?? raw.countryId),
    federationId: toNullableString(raw.federation_id ?? raw.federationId),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    scopeKind:
      parseCompetitionPyramidScopeKind(
        toStringValue(raw.scope_kind ?? raw.scopeKind),
      ) ?? 'MIXED',
    branchKind:
      parseCompetitionPyramidBranchKind(
        toNullableString(raw.branch_kind ?? raw.branchKind),
      ) ?? null,
    isActive: toBooleanValue(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive),
    validFrom: toDateOnlyValue(raw.valid_from ?? raw.validFrom),
    validTo: toNullableDateOnlyValue(raw.valid_to ?? raw.validTo),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetitionTier(raw: Raw): CompetitionTier {
  return {
    id: toStringValue(raw.id),
    versionId: toNullableString(raw.version_id ?? raw.versionId),
    competitionPyramidId: toStringValue(
      raw.competition_pyramid_id ?? raw.competitionPyramidId,
    ),
    parentTierId: toNullableString(raw.parent_tier_id ?? raw.parentTierId),
    parentTierVersionId: toNullableString(
      raw.parent_tier_version_id ?? raw.parentTierVersionId,
    ),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    levelOrder: toNullableNumber(raw.level_order ?? raw.levelOrder),
    scopeKind:
      parseCompetitionTierScopeKind(
        toStringValue(raw.scope_kind ?? raw.scopeKind),
      ) ?? 'MIXED',
    branchKind:
      parseCompetitionStructureBranchKind(
        toNullableString(raw.branch_kind ?? raw.branchKind),
      ) ?? null,
    participantScope:
      parseParticipantScope(
        toStringValue(raw.participant_scope ?? raw.participantScope),
      ) ?? 'CLUB',
    isActive: toBooleanValue(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetitionPyramidMetadata(
  raw: Record<string, unknown>,
): CompetitionPyramidListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  return {
    page: toNumberValue(raw.page, DEFAULT_PAGE),
    pageSize: toNumberValue(raw.page_size ?? raw.pageSize, DEFAULT_PAGE_SIZE),
    totalItems: toNumberValue(raw.total_items ?? raw.totalItems),
    totalPages: toNumberValue(raw.total_pages ?? raw.totalPages, 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: filters
      ? {
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as CompetitionStructureSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CompetitionStructureStatusFilter)
              : undefined,
          countryId:
            typeof filters.country_id === 'string'
              ? filters.country_id
              : typeof filters.countryId === 'string'
                ? filters.countryId
                : undefined,
          federationId:
            typeof filters.federation_id === 'string'
              ? filters.federation_id
              : typeof filters.federationId === 'string'
                ? filters.federationId
                : undefined,
          scopeKind:
            parseCompetitionPyramidScopeKind(
              toNullableString(filters.scope_kind ?? filters.scopeKind),
            ) ?? undefined,
          branchKind:
            parseCompetitionPyramidBranchKind(
              toNullableString(filters.branch_kind ?? filters.branchKind),
            ) ?? undefined,
          asOfDate:
            toNullableDateOnlyValue(filters.as_of_date ?? filters.asOfDate) ??
            undefined,
        }
      : undefined,
  };
}

export function mapCompetitionTierMetadata(
  raw: Record<string, unknown>,
): CompetitionTierListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  return {
    page: toNumberValue(raw.page, DEFAULT_PAGE),
    pageSize: toNumberValue(raw.page_size ?? raw.pageSize, DEFAULT_PAGE_SIZE),
    totalItems: toNumberValue(raw.total_items ?? raw.totalItems),
    totalPages: toNumberValue(raw.total_pages ?? raw.totalPages, 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: filters
      ? {
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as CompetitionStructureSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CompetitionStructureStatusFilter)
              : undefined,
          competitionPyramidId:
            typeof filters.competition_pyramid_id === 'string'
              ? filters.competition_pyramid_id
              : typeof filters.competitionPyramidId === 'string'
                ? filters.competitionPyramidId
                : undefined,
          parentTierId:
            typeof filters.parent_tier_id === 'string'
              ? filters.parent_tier_id
              : typeof filters.parentTierId === 'string'
                ? filters.parentTierId
                : undefined,
          participantScope:
            parseParticipantScope(
              toNullableString(
                filters.participant_scope ?? filters.participantScope,
              ),
            ) ?? undefined,
          scopeKind:
            parseCompetitionTierScopeKind(
              toNullableString(filters.scope_kind ?? filters.scopeKind),
            ) ?? undefined,
          branchKind:
            parseCompetitionStructureBranchKind(
              toNullableString(filters.branch_kind ?? filters.branchKind),
            ) ?? undefined,
          asOfDate:
            toNullableDateOnlyValue(filters.as_of_date ?? filters.asOfDate) ??
            undefined,
        }
      : undefined,
  };
}
