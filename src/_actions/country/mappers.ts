/** @format */

import { parseContinentCode } from '@/_constants/continents';
import type {
  Country,
  CountryListMetadata,
  CountrySort,
  CountryStatusFilter,
  ProvinceAdmin,
} from '@/_types/country';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

type RawCountry = Record<string, unknown>;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function mapCountry(raw: RawCountry): Country {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    translationKey: String(raw.translation_key ?? raw.translationKey ?? ''),
    flagImageUrl: toNullableString(raw.flag_image_url ?? raw.flagImageUrl),
    iso2Code: toNullableString(raw.iso2_code ?? raw.iso2Code),
    iso3Code: toNullableString(raw.iso3_code ?? raw.iso3Code),
    continentCode: parseContinentCode(raw.continent_code ?? raw.continentCode),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    provinceCount: toOptionalNumber(raw.province_count ?? raw.provinceCount),
    cityCount: toOptionalNumber(raw.city_count ?? raw.cityCount),
  };
}

export function mapProvince(raw: RawCountry): ProvinceAdmin {
  return {
    name: String(raw.name ?? ''),
    activeCityCount:
      typeof raw.active_city_count === 'number'
        ? raw.active_city_count
        : typeof raw.activeCityCount === 'number'
          ? raw.activeCityCount
          : Number(raw.active_city_count ?? raw.activeCityCount ?? 0),
    inactiveCityCount:
      typeof raw.inactive_city_count === 'number'
        ? raw.inactive_city_count
        : typeof raw.inactiveCityCount === 'number'
          ? raw.inactiveCityCount
          : Number(raw.inactive_city_count ?? raw.inactiveCityCount ?? 0),
  };
}

export function mapMetadata(raw: Record<string, unknown>): CountryListMetadata {
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
              ? (filters.sort as CountrySort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as CountryStatusFilter)
              : undefined,
        }
      : undefined,
  };
}
