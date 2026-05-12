/** @format */

import {
  parsePersonCurrentProfession,
  parsePersonDominantFoot,
  parsePersonEthnicity,
  parsePersonGender,
  parsePersonHairColor,
  parsePersonSkinColor,
} from '@/_constants/enums/person';
import type {
  GeoRef,
  PersonAdminDetail,
  PersonAdminListItem,
  PersonCurrentLocationPublic,
  PersonListMetadata,
  PersonPublicDetail,
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';

type RawRecord = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().length > 0 ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null;
}

function mapGeoRef(raw: unknown): GeoRef | null {
  if (!isRecord(raw) || typeof raw.name !== 'string') {
    return null;
  }

  return {
    ...(typeof raw.id === 'string' ? { id: raw.id } : {}),
    name: raw.name,
    ...(typeof raw.slug === 'string' ? { slug: raw.slug } : {}),
  };
}

function mapCurrentLocation(raw: unknown): PersonCurrentLocationPublic | null {
  if (!isRecord(raw)) {
    return null;
  }

  const city = mapGeoRef(raw.city);
  const country = mapGeoRef(raw.country);
  const province_name = toNullableString(raw.province_name) ?? undefined;

  if (!city && !country && !province_name) {
    return null;
  }

  return {
    ...(city ? { city } : {}),
    ...(province_name ? { province_name } : {}),
    ...(country ? { country } : {}),
  };
}

export function mapPersonAdminListItem(raw: RawRecord): PersonAdminListItem {
  return {
    id: String(raw.id ?? ''),
    full_name: String(raw.full_name ?? ''),
    slug: String(raw.slug ?? ''),
    display_name: String(raw.display_name ?? ''),
    gender:
      (parsePersonGender(raw.gender) ??
        toStringValue(raw.gender)) as PersonAdminListItem['gender'],
    current_profession: parsePersonCurrentProfession(raw.current_profession),
    primary_nationality_country_id: toNullableString(
      raw.primary_nationality_country_id,
    ),
    portrait_asset_id: toNullableString(
      raw.portrait_asset_id ?? raw.portraitAssetId,
    ),
    is_public: Boolean(raw.is_public ?? raw.isPublic ?? raw.is_active ?? raw.isActive ?? false),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  };
}

export function mapPersonAdminDetail(raw: RawRecord): PersonAdminDetail {
  return {
    ...mapPersonAdminListItem(raw),
    first_name: toNullableString(raw.first_name),
    middle_name: toNullableString(raw.middle_name),
    last_name: toNullableString(raw.last_name),
    second_surname: toNullableString(raw.second_surname),
    known_as: toNullableString(raw.known_as),
    native_full_name: toNullableString(raw.native_full_name),
    birth_date: toNullableString(raw.birth_date),
    death_date: toNullableString(raw.death_date),
    is_deceased: Boolean(raw.is_deceased ?? false),
    birth_location_id: toNullableString(raw.birth_location_id),
    current_city_id: toNullableString(raw.current_city_id),
    primary_nationality_country_id: toNullableString(
      raw.primary_nationality_country_id,
    ),
    height_cm: toNullableNumber(raw.height_cm),
    weight_kg: toNullableNumber(raw.weight_kg),
    hair_color: parsePersonHairColor(raw.hair_color),
    ethnicity: parsePersonEthnicity(raw.ethnicity),
    skin_color: parsePersonSkinColor(raw.skin_color),
    dominant_foot: parsePersonDominantFoot(raw.dominant_foot),
    current_profession: parsePersonCurrentProfession(raw.current_profession),
    professional_division_debut_date: toNullableString(
      raw.professional_division_debut_date,
    ),
    retirement_date: toNullableString(raw.retirement_date),
    portrait_asset_id: toNullableString(
      raw.portrait_asset_id ?? raw.portraitAssetId,
    ),
  };
}

export function mapPersonPublicDetail(raw: RawRecord): PersonPublicDetail {
  return {
    slug: String(raw.slug ?? ''),
    full_name: String(raw.full_name ?? ''),
    display_name: String(raw.display_name ?? ''),
    first_name: toNullableString(raw.first_name),
    middle_name: toNullableString(raw.middle_name),
    last_name: toNullableString(raw.last_name),
    second_surname: toNullableString(raw.second_surname),
    known_as: toNullableString(raw.known_as),
    native_full_name: toNullableString(raw.native_full_name),
    gender:
      (parsePersonGender(raw.gender) ??
        toStringValue(raw.gender)) as PersonPublicDetail['gender'],
    birth_date: toNullableString(raw.birth_date),
    death_date: toNullableString(raw.death_date),
    is_deceased: Boolean(raw.is_deceased ?? false),
    birth_location: mapGeoRef(raw.birth_location),
    current_location: mapCurrentLocation(raw.current_location),
    primary_nationality: mapGeoRef(raw.primary_nationality),
    height_cm: toNullableNumber(raw.height_cm),
    weight_kg: toNullableNumber(raw.weight_kg),
    hair_color: parsePersonHairColor(raw.hair_color),
    ethnicity: parsePersonEthnicity(raw.ethnicity),
    skin_color: parsePersonSkinColor(raw.skin_color),
    dominant_foot: parsePersonDominantFoot(raw.dominant_foot),
    current_profession: parsePersonCurrentProfession(raw.current_profession),
    professional_division_debut_date: toNullableString(
      raw.professional_division_debut_date,
    ),
    retirement_date: toNullableString(raw.retirement_date),
    portrait_asset_id: toNullableString(
      raw.portrait_asset_id ?? raw.portraitAssetId,
    ),
  };
}

export function mapPersonMetadata(raw: RawRecord): PersonListMetadata {
  const filters = isRecord(raw.filters) ? raw.filters : null;

  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? 0),
    totalPages: Number(raw.total_pages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? false),
    hasPreviousPage: Boolean(raw.has_previous_page ?? false),
    filters: filters
      ? {
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as PersonSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as PersonStatusFilter)
              : undefined,
          gender: parsePersonGender(filters.gender) ?? undefined,
          current_profession:
            parsePersonCurrentProfession(filters.current_profession) ?? undefined,
        }
      : undefined,
  };
}
