/** @format */

import type {
  Club,
  ClubListItem,
  ClubListMetadata,
  ClubReference,
  ClubSort,
  ClubStatusFilter,
  PublicClub,
} from '@/_types/club';

type RawClub = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapClubReference(raw: unknown): ClubReference | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const value = raw as Record<string, unknown>;

  return {
    id: String(value.id ?? ''),
    name: String(value.name ?? ''),
    slug: String(value.slug ?? ''),
  };
}

export function mapClubListItem(raw: RawClub): ClubListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    countryId: toNullableString(raw.country_id ?? raw.countryId),
    cityId: toNullableString(raw.city_id ?? raw.cityId),
    primaryStadiumId: toNullableString(
      raw.primary_stadium_id ?? raw.primaryStadiumId,
    ),
    logoUrl: toNullableString(raw.logo_url ?? raw.logoUrl),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapClub(raw: RawClub): Club {
  const summary = mapClubListItem(raw);

  return {
    ...summary,
    acronym: toNullableString(raw.acronym),
    nativeName: toNullableString(raw.native_name ?? raw.nativeName),
    foundedAs: toNullableString(raw.founded_as ?? raw.foundedAs),
    foundedAt: toNullableString(raw.founded_at ?? raw.foundedAt),
    dissolvedAt: toNullableString(raw.dissolved_at ?? raw.dissolvedAt),
    isDissolved: Boolean(raw.is_dissolved ?? raw.isDissolved ?? false),
    officialWebsiteUrl: toNullableString(
      raw.official_website_url ?? raw.officialWebsiteUrl,
    ),
    heroImageUrl: toNullableString(raw.hero_image_url ?? raw.heroImageUrl),
  };
}

export function mapPublicClub(raw: RawClub): PublicClub {
  return {
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    acronym: toNullableString(raw.acronym),
    nativeName: toNullableString(raw.native_name ?? raw.nativeName),
    foundedAs: toNullableString(raw.founded_as ?? raw.foundedAs),
    foundedAt: toNullableString(raw.founded_at ?? raw.foundedAt),
    dissolvedAt: toNullableString(raw.dissolved_at ?? raw.dissolvedAt),
    isDissolved: Boolean(raw.is_dissolved ?? raw.isDissolved ?? false),
    country: mapClubReference(raw.country),
    city: mapClubReference(raw.city),
    primaryStadium: mapClubReference(
      raw.primary_stadium ?? raw.primaryStadium,
    ),
    officialWebsiteUrl: toNullableString(
      raw.official_website_url ?? raw.officialWebsiteUrl,
    ),
    logoUrl: toNullableString(raw.logo_url ?? raw.logoUrl),
    heroImageUrl: toNullableString(raw.hero_image_url ?? raw.heroImageUrl),
  };
}

export function mapClubMetadata(raw: Record<string, unknown>): ClubListMetadata {
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
              ? (filters.sort as ClubSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as ClubStatusFilter)
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
