/** @format */

import type {
  CompetitionType,
  CompetitionTypeListItem,
  CompetitionTypeListMetadata,
  CompetitionTypeSort,
  CompetitionTypeStatusFilter,
} from '@/_types/competitionType';
import {
  parseCompetitionTypeCategory,
  parseParticipantScope,
} from '@/_constants/enums/competition';

type RawCompetitionType = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function toNumberValue(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function mapCompetitionTypeListItem(
  raw: RawCompetitionType,
): CompetitionTypeListItem {
  return {
    id: toStringValue(raw.id),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    competitionTypeCategory:
      parseCompetitionTypeCategory(
        toStringValue(
          raw.competition_type_category ?? raw.competitionTypeCategory,
        ),
      ) ?? 'LEAGUE',
    participantScope:
      parseParticipantScope(
        toStringValue(raw.participant_scope ?? raw.participantScope),
      ) ?? 'CLUB',
    sortOrder: toNumberValue(raw.sort_order ?? raw.sortOrder),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapCompetitionType(raw: RawCompetitionType): CompetitionType {
  return mapCompetitionTypeListItem(raw);
}

export function mapCompetitionTypeMetadata(
  raw: Record<string, unknown>,
): CompetitionTypeListMetadata {
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
              ? (filters.sort as CompetitionTypeSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CompetitionTypeStatusFilter)
              : undefined,
          competitionTypeCategory:
            typeof filters.competition_type_category === 'string'
              ? filters.competition_type_category
              : typeof filters.competitionTypeCategory === 'string'
                ? filters.competitionTypeCategory
                : undefined,
          participantScope:
            typeof filters.participant_scope === 'string'
              ? filters.participant_scope
              : typeof filters.participantScope === 'string'
                ? filters.participantScope
                : undefined,
        }
      : undefined,
  };
}
