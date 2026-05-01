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
  Person,
  PersonListItem,
  PersonListMetadata,
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';

type RawPerson = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapPersonListItem(raw: RawPerson): PersonListItem {
  return {
    id: String(raw.id ?? ''),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    slug: String(raw.slug ?? ''),
    displayName: toStringValue(raw.display_name ?? raw.displayName),
    gender: parsePersonGender(raw.gender),
    currentProfession: parsePersonCurrentProfession(
      raw.current_profession ?? raw.currentProfession,
    ),
    primaryNationalityCountryId: toNullableString(
      raw.primary_nationality_country_id ?? raw.primaryNationalityCountryId,
    ),
    avatarImageUrl: toNullableString(
      raw.avatar_image_url ?? raw.avatarImageUrl,
    ),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapPerson(raw: RawPerson): Person {
  const summary = mapPersonListItem(raw);

  return {
    ...summary,
    firstName: toNullableString(raw.first_name ?? raw.firstName),
    middleName: toNullableString(raw.middle_name ?? raw.middleName),
    lastName: toNullableString(raw.last_name ?? raw.lastName),
    secondSurname: toNullableString(
      raw.second_surname ?? raw.secondSurname,
    ),
    knownAs: toNullableString(raw.known_as ?? raw.knownAs),
    nativeFullName: toNullableString(
      raw.native_full_name ?? raw.nativeFullName,
    ),
    birthDate: toNullableString(raw.birth_date ?? raw.birthDate),
    deathDate: toNullableString(raw.death_date ?? raw.deathDate),
    isDeceased: Boolean(raw.is_deceased ?? raw.isDeceased ?? false),
    birthLocationId: toNullableString(
      raw.birth_location_id ?? raw.birthLocationId,
    ),
    heightCm: toNullableNumber(raw.height_cm ?? raw.heightCm),
    weightKg: toNullableNumber(raw.weight_kg ?? raw.weightKg),
    hairColor: parsePersonHairColor(raw.hair_color ?? raw.hairColor),
    ethnicity: parsePersonEthnicity(raw.ethnicity),
    skinColor: parsePersonSkinColor(raw.skin_color ?? raw.skinColor),
    dominantFoot: parsePersonDominantFoot(
      raw.dominant_foot ?? raw.dominantFoot,
    ),
    professionalDivisionDebutDate: toNullableString(
      raw.professional_division_debut_date ??
        raw.professionalDivisionDebutDate,
    ),
    retirementDate: toNullableString(
      raw.retirement_date ?? raw.retirementDate,
    ),
    heroImageUrl: toNullableString(raw.hero_image_url ?? raw.heroImageUrl),
  };
}

export function mapPersonMetadata(
  raw: Record<string, unknown>,
): PersonListMetadata {
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
              ? (filters.sort as PersonSort)
              : undefined,
          status:
            typeof filters.status === 'string'
              ? (filters.status as PersonStatusFilter)
              : undefined,
          gender: parsePersonGender(filters.gender) ?? undefined,
          currentProfession: parsePersonCurrentProfession(
            filters.current_profession ?? filters.currentProfession,
          ) ?? undefined,
        }
      : undefined,
  };
}
