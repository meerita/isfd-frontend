/** @format */

import type {
  CompetitionPyramid,
  CompetitionPyramidListMetadata,
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
  CompetitionTier,
  CompetitionTierListMetadata,
} from '@/_types/competitionStructure';
import {
  parseCompetitionScopeKind,
  parseParticipantScope,
} from '@/_constants/enums/competition';

type Raw = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

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

function toNumberValue(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function mapCompetitionPyramid(raw: Raw): CompetitionPyramid {
  return {
    id: toStringValue(raw.id),
    countryId: toStringValue(raw.country_id ?? raw.countryId),
    federationId: toNullableString(raw.federation_id ?? raw.federationId),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    scopeKind:
      parseCompetitionScopeKind(
        toStringValue(raw.scope_kind ?? raw.scopeKind),
      ) ?? 'MIXED',
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetitionTier(raw: Raw): CompetitionTier {
  return {
    id: toStringValue(raw.id),
    competitionPyramidId: toStringValue(
      raw.competition_pyramid_id ?? raw.competitionPyramidId,
    ),
    parentTierId: toNullableString(raw.parent_tier_id ?? raw.parentTierId),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    levelOrder: toNullableNumber(raw.level_order ?? raw.levelOrder),
    scopeKind:
      parseCompetitionScopeKind(
        toStringValue(raw.scope_kind ?? raw.scopeKind),
      ) ?? 'MIXED',
    participantScope:
      parseParticipantScope(
        toStringValue(raw.participant_scope ?? raw.participantScope),
      ) ?? 'CLUB',
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
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
            parseCompetitionScopeKind(
              toNullableString(filters.scope_kind ?? filters.scopeKind),
            ) ?? undefined,
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
            parseCompetitionScopeKind(
              toNullableString(filters.scope_kind ?? filters.scopeKind),
            ) ?? undefined,
        }
      : undefined,
  };
}
