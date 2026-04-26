/** @format */

// File: src/_actions/city/mappers.ts
// Purpose: Pure mapping functions for city API responses (no 'use server' — not server actions)

import type { City } from '@/_types/city';
import type { GeoMetadata } from '@/_types/country';

type RawCity = Record<string, unknown>;

export function mapCity(raw: RawCity): City {
  return {
    id: String(raw.id ?? ''),
    countryId: String(raw.country_id ?? raw.countryId ?? ''),
    countryName:
      raw.country_name != null ? String(raw.country_name)
      : raw.countryName != null ? String(raw.countryName)
      : null,
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    translationKey: String(raw.translation_key ?? raw.translationKey ?? ''),
    regionName:
      raw.region_name != null ? String(raw.region_name)
      : raw.regionName != null ? String(raw.regionName)
      : null,
    provinceName:
      raw.province_name != null ? String(raw.province_name)
      : raw.provinceName != null ? String(raw.provinceName)
      : null,
    latitude:
      typeof raw.latitude === 'number' ? raw.latitude
      : raw.latitude != null ? Number(raw.latitude)
      : null,
    longitude:
      typeof raw.longitude === 'number' ? raw.longitude
      : raw.longitude != null ? Number(raw.longitude)
      : null,
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function mapMetadata(raw: Record<string, unknown>): GeoMetadata {
  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(raw.has_previous_page ?? raw.hasPreviousPage ?? false),
  };
}
