/** @format */

import type {
  Brand,
  BrandListItem,
  BrandListMetadata,
  BrandSort,
  BrandStatusFilter,
} from '@/_types/brand';

type RawBrand = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapBrandListItem(raw: RawBrand): BrandListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    isActive: Boolean(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapBrand(raw: RawBrand): Brand {
  const summary = mapBrandListItem(raw);

  return {
    ...summary,
    websiteUrl: toNullableString(raw.website_url ?? raw.websiteUrl),
    iconImageUrl: toNullableString(raw.icon_image_url ?? raw.iconImageUrl),
    detailImageUrl: toNullableString(raw.detail_image_url ?? raw.detailImageUrl),
  };
}

export function mapBrandMetadata(raw: Record<string, unknown>): BrandListMetadata {
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
              ? (filters.sort as BrandSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as BrandStatusFilter)
              : undefined,
        }
      : undefined,
  };
}
