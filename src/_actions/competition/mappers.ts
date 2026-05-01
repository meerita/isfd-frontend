/** @format */

import type {
  Competition,
  CompetitionListItem,
  CompetitionListMetadata,
  CompetitionSort,
  CompetitionStatusFilter,
} from '@/_types/competition';

type RawCompetition = Record<string, unknown>;

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

function toNumberValue(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function mapCompetitionListItem(raw: RawCompetition): CompetitionListItem {
  return {
    id: toStringValue(raw.id),
    competitionTypeId: toStringValue(
      raw.competition_type_id ?? raw.competitionTypeId,
    ),
    federationId: toNullableString(raw.federation_id ?? raw.federationId),
    countryId: toNullableString(raw.country_id ?? raw.countryId),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    startedOn: toNullableString(raw.started_on ?? raw.startedOn),
    endedOn: toNullableString(raw.ended_on ?? raw.endedOn),
    sortOrder: toNumberValue(raw.sort_order ?? raw.sortOrder),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetition(raw: RawCompetition): Competition {
  return mapCompetitionListItem(raw);
}

export function mapCompetitionMetadata(
  raw: Record<string, unknown>,
): CompetitionListMetadata {
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
              ? (filters.sort as CompetitionSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CompetitionStatusFilter)
              : undefined,
          competitionTypeId:
            typeof filters.competition_type_id === 'string'
              ? filters.competition_type_id
              : typeof filters.competitionTypeId === 'string'
                ? filters.competitionTypeId
                : undefined,
          federationId:
            typeof filters.federation_id === 'string'
              ? filters.federation_id
              : typeof filters.federationId === 'string'
                ? filters.federationId
                : undefined,
          countryId:
            typeof filters.country_id === 'string'
              ? filters.country_id
              : typeof filters.countryId === 'string'
                ? filters.countryId
                : undefined,
        }
      : undefined,
  };
}
