/** @format */

import { parseStadiumSurfaceType } from '@/_constants/enums/stadium';
import type {
  Stadium,
  StadiumListItem,
  StadiumListMetadata,
  StadiumSort,
  StadiumStatusFilter,
} from '@/_types/stadium';

type RawStadium = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

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

function toNullableReferenceId(value: unknown): string | null {
  const direct = toNullableString(value);
  if (direct) return direct;

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return toNullableString((value as Record<string, unknown>).id);
}

function toFormerNames(value: unknown): ReadonlyArray<string> {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map(entry => entry.trim())
    .filter(Boolean);
}

export function mapStadiumListItem(raw: RawStadium): StadiumListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    formerNames: toFormerNames(raw.former_names ?? raw.formerNames),
    countryId: toNullableReferenceId(
      raw.country_id ?? raw.countryId ?? raw.country,
    ),
    cityId: toNullableReferenceId(raw.city_id ?? raw.cityId ?? raw.city),
    primaryClubId: toNullableReferenceId(
      raw.primary_club_id ?? raw.primaryClubId ?? raw.primary_club ?? raw.primaryClub,
    ),
    imageUrl: toNullableString(raw.image_url ?? raw.imageUrl),
    seatCount: toNullableNumber(raw.seat_count ?? raw.seatCount),
    surfaceType: parseStadiumSurfaceType(raw.surface_type ?? raw.surfaceType),
    isActive: Boolean(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapStadium(raw: RawStadium): Stadium {
  return mapStadiumListItem(raw);
}

export function mapStadiumMetadata(
  raw: Record<string, unknown>,
): StadiumListMetadata {
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
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: filters
      ? {
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as StadiumSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as StadiumStatusFilter)
              : undefined,
          countryId:
            typeof filters.country_id === 'string'
              ? filters.country_id
              : typeof filters.countryId === 'string'
                ? filters.countryId
                : undefined,
          cityId:
            typeof filters.city_id === 'string'
              ? filters.city_id
              : typeof filters.cityId === 'string'
                ? filters.cityId
                : undefined,
          primaryClubId:
            typeof filters.primary_club_id === 'string'
              ? filters.primary_club_id
              : typeof filters.primaryClubId === 'string'
                ? filters.primaryClubId
                : undefined,
        }
      : undefined,
  };
}
