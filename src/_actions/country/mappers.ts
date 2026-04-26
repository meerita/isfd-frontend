/** @format */

// File: src/_actions/country/mappers.ts
// Purpose: Pure mapping functions for country API responses (no 'use server' — not server actions)

import type { Country, GeoMetadata } from '@/_types/country';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

type RawCountry = Record<string, unknown>;

export function mapCountry(raw: RawCountry): Country {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    translationKey: String(raw.translation_key ?? raw.translationKey ?? ''),
    flagImageUrl:
      raw.flag_image_url != null
        ? String(raw.flag_image_url)
        : raw.flagImageUrl != null
          ? String(raw.flagImageUrl)
          : null,
    iso2Code:
      raw.iso2_code != null
        ? String(raw.iso2_code)
        : raw.iso2Code != null
          ? String(raw.iso2Code)
          : null,
    iso3Code:
      raw.iso3_code != null
        ? String(raw.iso3_code)
        : raw.iso3Code != null
          ? String(raw.iso3Code)
          : null,
    continentCode:
      raw.continent_code != null
        ? String(raw.continent_code)
        : raw.continentCode != null
          ? String(raw.continentCode)
          : null,
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    provinceCount:
      typeof raw.province_count === 'number'
        ? raw.province_count
        : typeof raw.provinceCount === 'number'
          ? raw.provinceCount
          : undefined,
    cityCount:
      typeof raw.city_count === 'number'
        ? raw.city_count
        : typeof raw.cityCount === 'number'
          ? raw.cityCount
          : undefined,
  };
}

export function mapMetadata(raw: Record<string, unknown>): GeoMetadata {
  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
  };
}
