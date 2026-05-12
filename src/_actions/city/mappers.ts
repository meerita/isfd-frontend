/** @format */

import type {
  AdminCitySort,
  City,
  CityListMetadata,
  CityStatusFilter,
} from '@/_types/city';

type RawCity = Record<string, unknown>;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function mapCity(raw: RawCity): City {
  return {
    id: String(raw.id ?? ''),
    countryId: String(raw.country_id ?? raw.countryId ?? ''),
    countryName: toNullableString(raw.country_name ?? raw.countryName),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    translationKey: String(raw.translation_key ?? raw.translationKey ?? ''),
    regionName: toNullableString(raw.region_name ?? raw.regionName),
    provinceName: toNullableString(raw.province_name ?? raw.provinceName),
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    isActive: Boolean(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive ?? false),
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function mapMetadata(raw: Record<string, unknown>): CityListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(raw.has_previous_page ?? raw.hasPreviousPage ?? false),
    filters: filters
      ? {
          countryId:
            typeof filters.country_id === 'string'
              ? filters.country_id
              : typeof filters.countryId === 'string'
                ? filters.countryId
                : undefined,
          province:
            typeof filters.province === 'string' ? filters.province : undefined,
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as AdminCitySort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CityStatusFilter)
              : undefined,
        }
      : undefined,
  };
}
