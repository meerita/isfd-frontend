/** @format */

import type {
  Season,
  SeasonListItem,
  SeasonListMetadata,
  SeasonSort,
  SeasonStatusFilter,
} from '@/_types/season';

type RawSeason = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function toNullableNumber(value: unknown): number | null {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function toNumberValue(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function mapSeasonListItem(raw: RawSeason): SeasonListItem {
  return {
    id: toStringValue(raw.id),
    code: toStringValue(raw.code),
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    startYear: toNumberValue(raw.start_year ?? raw.startYear),
    endYear: toNullableNumber(raw.end_year ?? raw.endYear),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapSeason(raw: RawSeason): Season {
  return mapSeasonListItem(raw);
}

export function mapSeasonMetadata(raw: Record<string, unknown>): SeasonListMetadata {
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
              ? (filters.sort as SeasonSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as SeasonStatusFilter)
              : undefined,
          year:
            Number.isFinite(Number(filters.year)) && filters.year !== null
              ? Number(filters.year)
              : null,
        }
      : undefined,
  };
}
