/** @format */

import type { ClubActionState } from '@/_types/club';

const UNSET = Symbol('unset');
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function bool(formData: FormData, key: string, fallback = false): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') return fallback;

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (DATE_PATTERN.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isFutureDate(value: string): boolean {
  return value > new Date().toISOString().slice(0, 10);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formError(
  reason: string,
  message: string,
  error: string,
): ClubActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
}

function validateNullableUuid(
  value: string | null,
  reason: string,
  message: string,
): ClubActionState | null {
  if (!value || isValidUuid(value)) return null;
  return formError(reason, message, message);
}

function validateNullableUrl(
  value: string | null,
  reason: string,
  message: string,
): ClubActionState | null {
  if (!value || isValidHttpUrl(value)) return null;
  return formError(reason, message, message);
}

function validateDateRange(
  foundedAt: string | null,
  dissolvedAt: string | null,
  isDissolved: boolean,
): ClubActionState | null {
  if (foundedAt && isFutureDate(foundedAt)) {
    return formError(
      'CLUB_FOUNDED_AT_IN_FUTURE',
      'Founded at cannot be in the future.',
      'Founded at cannot be in the future.',
    );
  }

  if (dissolvedAt && isFutureDate(dissolvedAt)) {
    return formError(
      'CLUB_DISSOLVED_AT_IN_FUTURE',
      'Dissolved at cannot be in the future.',
      'Dissolved at cannot be in the future.',
    );
  }

  if (dissolvedAt && !isDissolved) {
    return formError(
      'CLUB_DISSOLVED_AT_REQUIRES_DISSOLVED',
      'Dissolved at requires the club to be dissolved.',
      'Set the club as dissolved before adding a dissolved date.',
    );
  }

  if (foundedAt && dissolvedAt && dissolvedAt < foundedAt) {
    return formError(
      'CLUB_DISSOLVED_AT_BEFORE_FOUNDED_AT',
      'Dissolved at cannot be before founded at.',
      'Dissolved at cannot be before founded at.',
    );
  }

  return null;
}

function partialNullable(
  value: string | null,
  original: string | null,
): string | null | typeof UNSET {
  if (value === original) return UNSET;
  return value;
}

function partialRequired(
  value: string,
  original: string,
): string | typeof UNSET {
  if (value === original) return UNSET;
  return value;
}

export function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  if (DATE_PATTERN.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toISOString().slice(0, 10);
}

export function buildCreateClubBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: ClubActionState } {
  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'CLUB_NAME_REQUIRED',
        'Club name is required.',
        'Club name is required.',
      ),
    };
  }

  const countryId = optionalString(str(formData, 'countryId'));
  const cityId = optionalString(str(formData, 'cityId'));
  const primaryStadiumId = optionalString(str(formData, 'primaryStadiumId'));
  const isDissolved = bool(formData, 'isDissolved', false);

  if (cityId && !countryId) {
    return {
      error: formError(
        'CLUB_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  const rawFoundedAt = str(formData, 'foundedAt');
  const rawDissolvedAt = str(formData, 'dissolvedAt');
  const foundedAt = normalizeDateInput(rawFoundedAt);
  const dissolvedAt = normalizeDateInput(rawDissolvedAt);

  if (rawFoundedAt && !foundedAt) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Founded at must use YYYY-MM-DD.',
        'Enter a valid founded at date in YYYY-MM-DD format.',
      ),
    };
  }

  if (rawDissolvedAt && !dissolvedAt) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Dissolved at must use YYYY-MM-DD.',
        'Enter a valid dissolved at date in YYYY-MM-DD format.',
      ),
    };
  }

  const validations = [
    validateNullableUuid(
      countryId,
      'CLUB_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      cityId,
      'CLUB_INVALID_CITY_ID',
      'Select a valid city.',
    ),
    validateNullableUuid(
      primaryStadiumId,
      'CLUB_INVALID_PRIMARY_STADIUM_ID',
      'Select a valid primary stadium.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'officialWebsiteUrl')),
      'CLUB_INVALID_OFFICIAL_WEBSITE_URL',
      'Enter a valid official website URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'logoUrl')),
      'CLUB_INVALID_LOGO_URL',
      'Enter a valid logo URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'heroImageUrl')),
      'CLUB_INVALID_HERO_IMAGE_URL',
      'Enter a valid hero image URL.',
    ),
    validateDateRange(foundedAt, dissolvedAt, isDissolved),
  ];

  const validationError = validations.find(Boolean);
  if (validationError) {
    return { error: validationError };
  }

  const body: Record<string, unknown> = {
    name,
    is_active: bool(formData, 'isActive', true),
    is_dissolved: isDissolved,
  };

  const shortName = optionalString(str(formData, 'shortName'));
  const acronym = optionalString(str(formData, 'acronym'));
  const nativeName = optionalString(str(formData, 'nativeName'));
  const foundedAs = optionalString(str(formData, 'foundedAs'));
  const officialWebsiteUrl = optionalString(str(formData, 'officialWebsiteUrl'));
  const logoUrl = optionalString(str(formData, 'logoUrl'));
  const heroImageUrl = optionalString(str(formData, 'heroImageUrl'));

  if (shortName !== null) body.short_name = shortName;
  if (acronym !== null) body.acronym = acronym;
  if (nativeName !== null) body.native_name = nativeName;
  if (foundedAs !== null) body.founded_as = foundedAs;
  if (foundedAt !== null) body.founded_at = foundedAt;
  if (dissolvedAt !== null) body.dissolved_at = dissolvedAt;
  if (countryId !== null) body.country_id = countryId;
  if (countryId !== null && cityId !== null) body.city_id = cityId;
  if (primaryStadiumId !== null) body.primary_stadium_id = primaryStadiumId;
  if (officialWebsiteUrl !== null) body.official_website_url = officialWebsiteUrl;
  if (logoUrl !== null) body.logo_url = logoUrl;
  if (heroImageUrl !== null) body.hero_image_url = heroImageUrl;

  return { body };
}

export function buildUpdateClubBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: ClubActionState;
  clubId?: string;
} {
  const clubId = str(formData, 'clubId');
  if (!clubId) {
    return {
      error: formError(
        'CLUB_ID_REQUIRED',
        'Missing club identifier.',
        'Club identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  const originalName = str(formData, 'original_name');
  const nameResult = partialRequired(name, originalName);
  if (nameResult !== UNSET && !nameResult) {
    return {
      clubId,
      error: formError(
        'CLUB_NAME_REQUIRED',
        'Club name is required.',
        'Club name is required.',
      ),
    };
  }

  const originalCountryId = optionalString(str(formData, 'original_countryId'));
  const currentCountryId = optionalString(str(formData, 'countryId'));
  const effectiveCountryId = currentCountryId ?? originalCountryId;
  const originalCityId = optionalString(str(formData, 'original_cityId'));
  const currentCityId = optionalString(str(formData, 'cityId'));
  const originalPrimaryStadiumId = optionalString(
    str(formData, 'original_primaryStadiumId'),
  );
  const currentPrimaryStadiumId = optionalString(str(formData, 'primaryStadiumId'));

  if (currentCityId && !effectiveCountryId) {
    return {
      clubId,
      error: formError(
        'CLUB_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  const rawFoundedAt = str(formData, 'foundedAt');
  const rawDissolvedAt = str(formData, 'dissolvedAt');
  const foundedAt = normalizeDateInput(rawFoundedAt);
  const dissolvedAt = normalizeDateInput(rawDissolvedAt);
  const originalFoundedAt = optionalString(str(formData, 'original_foundedAt'));
  const originalDissolvedAt = optionalString(str(formData, 'original_dissolvedAt'));
  const currentIsDissolved = bool(formData, 'isDissolved', false);
  const originalIsDissolved = bool(formData, 'original_isDissolved', false);
  const effectiveFoundedAt = foundedAt ?? originalFoundedAt;
  const effectiveDissolvedAt = currentIsDissolved
    ? dissolvedAt
    : originalDissolvedAt && originalIsDissolved
      ? null
      : dissolvedAt;

  if (rawFoundedAt && !foundedAt) {
    return {
      clubId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Founded at must use YYYY-MM-DD.',
        'Enter a valid founded at date in YYYY-MM-DD format.',
      ),
    };
  }

  if (rawDissolvedAt && !dissolvedAt) {
    return {
      clubId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Dissolved at must use YYYY-MM-DD.',
        'Enter a valid dissolved at date in YYYY-MM-DD format.',
      ),
    };
  }

  const validations = [
    validateNullableUuid(
      currentCountryId,
      'CLUB_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      currentCityId,
      'CLUB_INVALID_CITY_ID',
      'Select a valid city.',
    ),
    validateNullableUuid(
      currentPrimaryStadiumId,
      'CLUB_INVALID_PRIMARY_STADIUM_ID',
      'Select a valid primary stadium.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'officialWebsiteUrl')),
      'CLUB_INVALID_OFFICIAL_WEBSITE_URL',
      'Enter a valid official website URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'logoUrl')),
      'CLUB_INVALID_LOGO_URL',
      'Enter a valid logo URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'heroImageUrl')),
      'CLUB_INVALID_HERO_IMAGE_URL',
      'Enter a valid hero image URL.',
    ),
    validateDateRange(effectiveFoundedAt, effectiveDissolvedAt, currentIsDissolved),
  ];

  const validationError = validations.find(Boolean);
  if (validationError) {
    return { clubId, error: validationError };
  }

  const body: Record<string, unknown> = {};

  if (nameResult !== UNSET) {
    body.name = nameResult;
  }

  const nullableFieldEntries = [
    ['short_name', optionalString(str(formData, 'shortName')), optionalString(str(formData, 'original_shortName'))],
    ['acronym', optionalString(str(formData, 'acronym')), optionalString(str(formData, 'original_acronym'))],
    ['native_name', optionalString(str(formData, 'nativeName')), optionalString(str(formData, 'original_nativeName'))],
    ['founded_as', optionalString(str(formData, 'foundedAs')), optionalString(str(formData, 'original_foundedAs'))],
    ['official_website_url', optionalString(str(formData, 'officialWebsiteUrl')), optionalString(str(formData, 'original_officialWebsiteUrl'))],
    ['logo_url', optionalString(str(formData, 'logoUrl')), optionalString(str(formData, 'original_logoUrl'))],
    ['hero_image_url', optionalString(str(formData, 'heroImageUrl')), optionalString(str(formData, 'original_heroImageUrl'))],
  ] as const;

  for (const [key, currentValue, originalValue] of nullableFieldEntries) {
    const result = partialNullable(currentValue, originalValue);
    if (result !== UNSET) {
      body[key] = result;
    }
  }

  const countryResult = partialNullable(currentCountryId, originalCountryId);
  if (countryResult !== UNSET) {
    body.country_id = countryResult;
  }

  const nextCityValue =
    currentCountryId === null && originalCountryId !== null ? null : currentCityId;
  const cityResult = partialNullable(nextCityValue, originalCityId);
  if (cityResult !== UNSET) {
    body.city_id = cityResult;
  }

  const primaryStadiumResult = partialNullable(
    currentPrimaryStadiumId,
    originalPrimaryStadiumId,
  );
  if (primaryStadiumResult !== UNSET) {
    body.primary_stadium_id = primaryStadiumResult;
  }

  const foundedAtResult = partialNullable(foundedAt, originalFoundedAt);
  if (foundedAtResult !== UNSET) {
    body.founded_at = foundedAtResult;
  }

  const isDissolvedChanged = currentIsDissolved !== originalIsDissolved;
  if (isDissolvedChanged) {
    body.is_dissolved = currentIsDissolved;
  }

  if (!currentIsDissolved) {
    if (originalDissolvedAt !== null || rawDissolvedAt) {
      body.dissolved_at = null;
    }
  } else {
    const dissolvedAtResult = partialNullable(dissolvedAt, originalDissolvedAt);
    if (dissolvedAtResult !== UNSET) {
      body.dissolved_at = dissolvedAtResult;
    }
  }

  const currentIsActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (currentIsActive !== originalIsActive) {
    body.is_active = currentIsActive;
  }

  if (Object.keys(body).length === 0) {
    return { clubId, body: {} };
  }

  return { clubId, body };
}
