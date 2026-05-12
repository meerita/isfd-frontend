/** @format */

import type {
  Federation,
  FederationLevel,
  FederationListItem,
  FederationListMetadata,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';

type RawFederation = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toFederationLevel(value: unknown): FederationLevel {
  if (value === 'WORLD' || value === 'CONTINENTAL' || value === 'NATIONAL') {
    return value;
  }

  return 'NATIONAL';
}

export function mapFederationListItem(raw: RawFederation): FederationListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    federationLevel: toFederationLevel(raw.federation_level ?? raw.federationLevel),
    iconUrl: toNullableString(raw.icon_url ?? raw.iconUrl),
    countryId: toNullableString(raw.country_id ?? raw.countryId),
    cityId: toNullableString(raw.city_id ?? raw.cityId),
    isActive: Boolean(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapFederation(raw: RawFederation): Federation {
  const summary = mapFederationListItem(raw);

  return {
    ...summary,
    nativeName: toNullableString(raw.native_name ?? raw.nativeName),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    acronym: toNullableString(raw.acronym),
    foundationDate: toNullableString(raw.foundation_date ?? raw.foundationDate),
    dissolutionDate: toNullableString(
      raw.dissolution_date ?? raw.dissolutionDate,
    ),
    officialWebsiteUrl: toNullableString(
      raw.official_website_url ?? raw.officialWebsiteUrl,
    ),
    heroImageUrl: toNullableString(raw.hero_image_url ?? raw.heroImageUrl),
  };
}

export function mapFederationMetadata(
  raw: Record<string, unknown>,
): FederationListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  const mappedFilters = filters
    ? {
        sort:
          typeof filters.sort === 'string'
            ? (filters.sort as FederationSort)
            : undefined,
        status:
          typeof filters.status === 'string'
            ? (filters.status as FederationStatusFilter)
            : undefined,
        federationLevel:
          typeof filters.federation_level === 'string'
            ? toFederationLevel(filters.federation_level)
            : typeof filters.federationLevel === 'string'
              ? toFederationLevel(filters.federationLevel)
              : undefined,
      }
    : undefined;

  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: mappedFilters,
  };
}
