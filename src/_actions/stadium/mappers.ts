/** @format */

import { parseStadiumSurfaceType } from '@/_constants/enums/stadium';
import type {
  ClubRefResponse,
  GeoRefResponse,
  StadiumAdminDetail,
  StadiumAdminListItem,
  StadiumAdminListMetadata,
  StadiumAdminSort,
  StadiumImageResponse,
  StadiumPrimaryImageResponse,
  StadiumPublic,
  StadiumPublicListItem,
  StadiumPublicListMetadata,
  StadiumStatusFilter,
} from '@/_types/stadium';

type RawRecord = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toNullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function toFormerNames(value: unknown): ReadonlyArray<string> {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map(entry => entry.trim())
    .filter(Boolean);
}

function mapPrimaryImage(value: unknown): StadiumPrimaryImageResponse | null {
  if (!isRecord(value)) return null;

  return {
    id: toStringValue(value.id),
    asset_id: toStringValue(value.asset_id),
    url: toStringValue(value.url),
    width: Number(value.width ?? 0),
    height: Number(value.height ?? 0),
  };
}

function mapImage(value: unknown): StadiumImageResponse | null {
  if (!isRecord(value)) return null;

  const primary = mapPrimaryImage(value);
  if (!primary) return null;

  return {
    ...primary,
    is_primary: Boolean(value.is_primary),
    sort_order:
      typeof value.sort_order === 'number' && Number.isFinite(value.sort_order)
        ? value.sort_order
        : 0,
  };
}

function mapImages(value: unknown): ReadonlyArray<StadiumImageResponse> | null {
  if (value === null) return null;
  if (!Array.isArray(value)) return null;

  return value
    .map(mapImage)
    .filter((image): image is StadiumImageResponse => image !== null);
}

function mapGeoRef(value: unknown): GeoRefResponse | null {
  if (!isRecord(value)) return null;

  return {
    id: toStringValue(value.id),
    name: toStringValue(value.name),
    slug: toStringValue(value.slug),
  };
}

function mapClubRef(value: unknown): ClubRefResponse | null {
  if (!isRecord(value)) return null;

  return {
    id: toStringValue(value.id),
    name: toStringValue(value.name),
    slug: toStringValue(value.slug),
  };
}

export function mapPublicStadium(raw: RawRecord): StadiumPublic {
  return {
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    former_names: toFormerNames(raw.former_names),
    primary_image: mapPrimaryImage(raw.primary_image),
    images: mapImages(raw.images),
    official_website_url: toNullableString(raw.official_website_url),
    country: mapGeoRef(raw.country),
    city: mapGeoRef(raw.city),
    primary_club: mapClubRef(raw.primary_club),
    seat_count: toNullableNumber(raw.seat_count),
    surface_type: parseStadiumSurfaceType(raw.surface_type),
    pitch_length_meters: toNullableNumber(raw.pitch_length_meters),
    pitch_width_meters: toNullableNumber(raw.pitch_width_meters),
    opened_on: toNullableString(raw.opened_on),
    closed_on: raw.closed_on === null ? null : toNullableString(raw.closed_on),
    is_indoor: toNullableBoolean(raw.is_indoor),
    is_roofed: toNullableBoolean(raw.is_roofed),
  };
}

export function mapPublicStadiumListItem(raw: RawRecord): StadiumPublicListItem {
  return {
    slug: toStringValue(raw.slug),
    name: toStringValue(raw.name),
    former_names: toFormerNames(raw.former_names),
    primary_image: mapPrimaryImage(raw.primary_image),
    country: mapGeoRef(raw.country),
    city: mapGeoRef(raw.city),
    primary_club: mapClubRef(raw.primary_club),
    seat_count: toNullableNumber(raw.seat_count),
    surface_type: parseStadiumSurfaceType(raw.surface_type),
  };
}

export function mapAdminStadiumListItem(raw: RawRecord): StadiumAdminListItem {
  return {
    id: toStringValue(raw.id),
    name: toStringValue(raw.name),
    slug: toStringValue(raw.slug),
    former_names: toFormerNames(raw.former_names),
    primary_image: mapPrimaryImage(raw.primary_image),
    country_id:
      raw.country_id === null ? null : toNullableString(raw.country_id),
    city_id: raw.city_id === null ? null : toNullableString(raw.city_id),
    primary_club_id:
      raw.primary_club_id === null ? null : toNullableString(raw.primary_club_id),
    seat_count: toNullableNumber(raw.seat_count),
    surface_type: parseStadiumSurfaceType(raw.surface_type),
    is_public: Boolean(raw.is_public),
    created_at: toStringValue(raw.created_at),
    updated_at: toStringValue(raw.updated_at),
  };
}

export function mapAdminStadium(raw: RawRecord): StadiumAdminDetail {
  const summary = mapAdminStadiumListItem(raw);

  return {
    ...summary,
    images: mapImages(raw.images),
    official_website_url: toNullableString(raw.official_website_url),
    pitch_length_meters: toNullableNumber(raw.pitch_length_meters),
    pitch_width_meters: toNullableNumber(raw.pitch_width_meters),
    opened_on: toNullableString(raw.opened_on),
    closed_on: raw.closed_on === null ? null : toNullableString(raw.closed_on),
    is_indoor: toNullableBoolean(raw.is_indoor),
    is_roofed: toNullableBoolean(raw.is_roofed),
  };
}

function mapPaginationMetadata(raw: RawRecord): StadiumPublicListMetadata {
  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    page_size: Number(raw.page_size ?? DEFAULT_PAGE_SIZE),
    total_items: Number(raw.total_items ?? 0),
    total_pages: Number(raw.total_pages ?? 1),
    has_next_page: Boolean(raw.has_next_page),
    has_previous_page: Boolean(raw.has_previous_page),
  };
}

export function mapPublicStadiumMetadata(
  raw: RawRecord,
): StadiumPublicListMetadata {
  return mapPaginationMetadata(raw);
}

export function mapAdminStadiumMetadata(
  raw: RawRecord,
): StadiumAdminListMetadata {
  const filters = isRecord(raw.filters) ? raw.filters : {};

  return {
    ...mapPaginationMetadata(raw),
    filters: {
      sort:
        typeof filters.sort === 'string'
          ? (filters.sort as StadiumAdminSort)
          : 'updated_at_desc',
      status:
        typeof filters.status === 'string'
          ? (filters.status as StadiumStatusFilter)
          : 'all',
      country_id:
        filters.country_id === null ? null : toNullableString(filters.country_id),
      city_id: filters.city_id === null ? null : toNullableString(filters.city_id),
      primary_club_id:
        filters.primary_club_id === null
          ? null
          : toNullableString(filters.primary_club_id),
    },
  };
}

export function extractDataRecord(payload: unknown): RawRecord | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string' || typeof payload.slug === 'string') {
    return payload;
  }

  if (isRecord(payload.data)) return payload.data;
  if (isRecord(payload.stadium)) return payload.stadium;

  return null;
}

export function extractListPayload(payload: unknown): {
  data: RawRecord[];
  metadata: RawRecord | null;
} | null {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    return null;
  }

  return {
    data: payload.data.filter(isRecord),
    metadata: isRecord(payload.metadata) ? payload.metadata : null,
  };
}
