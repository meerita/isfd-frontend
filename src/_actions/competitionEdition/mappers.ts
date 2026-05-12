/** @format */

import type {
  CompetitionEdition,
  CompetitionEditionListMetadata,
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
  CompetitionEditionVisibilityFilter,
} from '@/_types/competitionEdition';
import { parseCompetitionEditionStatus } from '@/_constants/enums/competition';

type RawCompetitionEdition = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value ?? '');
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

export function mapCompetitionEdition(raw: RawCompetitionEdition): CompetitionEdition {
  return {
    id: toStringValue(raw.id),
    competitionId: toStringValue(raw.competition_id ?? raw.competitionId),
    competitionPyramidId: toNullableString(
      raw.competition_pyramid_id ?? raw.competitionPyramidId,
    ),
    primaryCompetitionTierId: toNullableString(
      raw.primary_competition_tier_id ?? raw.primaryCompetitionTierId,
    ),
    code: toNullableString(raw.code),
    slug: toStringValue(raw.slug),
    editionLabel: toNullableString(raw.edition_label ?? raw.editionLabel),
    name: toStringValue(raw.name),
    competitionName: toNullableString(
      raw.competition_name ?? raw.competitionName,
    ),
    competitionSlug: toNullableString(
      raw.competition_slug ?? raw.competitionSlug,
    ),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    year: toNullableNumber(raw.year),
    startedOn: toNullableString(raw.started_on ?? raw.startedOn),
    endedOn: toNullableString(raw.ended_on ?? raw.endedOn),
    editorialStatus:
      parseCompetitionEditionStatus(
        toStringValue(raw.editorial_status ?? raw.editorialStatus),
      ) ?? 'DRAFT',
    sortOrder: toNumberValue(raw.sort_order ?? raw.sortOrder),
    isPublic: Boolean(raw.is_public ?? raw.isPublic ?? false),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetitionEditionMetadata(
  raw: Record<string, unknown>,
): CompetitionEditionListMetadata {
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
              ? (filters.sort as CompetitionEditionSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CompetitionEditionStatusFilter)
              : undefined,
          visibility:
            typeof filters.visibility === 'string'
              ? (filters.visibility as CompetitionEditionVisibilityFilter)
              : undefined,
          competitionId:
            typeof filters.competition_id === 'string'
              ? filters.competition_id
              : typeof filters.competitionId === 'string'
                ? filters.competitionId
                : undefined,
          competitionPyramidId:
            typeof filters.competition_pyramid_id === 'string'
              ? filters.competition_pyramid_id
              : typeof filters.competitionPyramidId === 'string'
                ? filters.competitionPyramidId
                : undefined,
          primaryCompetitionTierId:
            typeof filters.primary_competition_tier_id === 'string'
              ? filters.primary_competition_tier_id
              : typeof filters.primaryCompetitionTierId === 'string'
                ? filters.primaryCompetitionTierId
                : undefined,
          year:
            Number.isFinite(Number(filters.year)) && filters.year !== null
              ? Number(filters.year)
              : null,
          q: typeof filters.q === 'string' ? filters.q : undefined,
        }
      : undefined,
  };
}
