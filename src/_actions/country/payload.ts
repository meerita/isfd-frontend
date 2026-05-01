/** @format */

import { parseContinentCode } from '@/_constants/continents';
import type { CountryActionState } from '@/_types/country';

const UNSET = Symbol('unset');
const ISO2_PATTERN = /^[A-Z]{2}$/;
const ISO3_PATTERN = /^[A-Z]{3}$/;
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

function normalizeUppercase(value: string): string {
  return value.trim().toUpperCase();
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
): CountryActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
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

function validateNullableIso2(value: string | null): CountryActionState | null {
  if (!value || ISO2_PATTERN.test(value)) return null;

  return formError(
    'COUNTRY_INVALID_ISO2_CODE',
    'ISO 2 code must contain exactly 2 uppercase letters.',
    'ISO 2 code must contain exactly 2 uppercase letters.',
  );
}

function validateNullableIso3(value: string | null): CountryActionState | null {
  if (!value || ISO3_PATTERN.test(value)) return null;

  return formError(
    'COUNTRY_INVALID_ISO3_CODE',
    'ISO 3 code must contain exactly 3 uppercase letters.',
    'ISO 3 code must contain exactly 3 uppercase letters.',
  );
}

function validateNullableContinent(
  value: string | null,
): CountryActionState | null {
  if (!value || parseContinentCode(value)) return null;

  return formError(
    'COUNTRY_INVALID_CONTINENT_CODE',
    'Continent code is invalid.',
    'Select a valid continent.',
  );
}

function validateNullableUrl(value: string | null): CountryActionState | null {
  if (!value || isValidHttpUrl(value)) return null;

  return formError(
    'COUNTRY_INVALID_FLAG_IMAGE_URL',
    'Flag image URL is invalid.',
    'Enter a valid flag image URL.',
  );
}

export function buildCreateCountryBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: CountryActionState } {
  const name = str(formData, 'name');

  if (!name) {
    return {
      error: formError(
        'COUNTRY_NAME_REQUIRED',
        'Country name is required.',
        'Country name is required.',
      ),
    };
  }

  return {
    body: {
      name,
    },
  };
}

export function buildUpdateCountryBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CountryActionState;
  countryId?: string;
} {
  const countryId = str(formData, 'countryId');

  if (!countryId) {
    return {
      error: formError(
        'COUNTRY_ID_REQUIRED',
        'Missing country identifier.',
        'Country identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  const originalName = str(formData, 'original_name');
  const iso2Code = optionalString(normalizeUppercase(str(formData, 'iso2Code')));
  const iso3Code = optionalString(normalizeUppercase(str(formData, 'iso3Code')));
  const continentCode = optionalString(
    normalizeUppercase(str(formData, 'continentCode')),
  );
  const flagImageUrl = optionalString(str(formData, 'flagImageUrl'));
  const originalIso2Code = optionalString(
    normalizeUppercase(str(formData, 'original_iso2Code')),
  );
  const originalIso3Code = optionalString(
    normalizeUppercase(str(formData, 'original_iso3Code')),
  );
  const originalContinentCode = optionalString(
    normalizeUppercase(str(formData, 'original_continentCode')),
  );
  const originalFlagImageUrl = optionalString(str(formData, 'original_flagImageUrl'));

  const nameResult = partialRequired(name, originalName);
  if (nameResult !== UNSET && !nameResult) {
    return {
      countryId,
      error: formError(
        'COUNTRY_NAME_REQUIRED',
        'Country name is required.',
        'Country name is required.',
      ),
    };
  }

  const validationError = [
    validateNullableIso2(iso2Code),
    validateNullableIso3(iso3Code),
    validateNullableContinent(continentCode),
    validateNullableUrl(flagImageUrl),
  ].find(Boolean);

  if (validationError) {
    return {
      countryId,
      error: validationError,
    };
  }

  const body: Record<string, unknown> = {};

  if (nameResult !== UNSET) {
    body.name = nameResult;
  }

  const iso2Result = partialNullable(iso2Code, originalIso2Code);
  if (iso2Result !== UNSET) body.iso2_code = iso2Result;

  const iso3Result = partialNullable(iso3Code, originalIso3Code);
  if (iso3Result !== UNSET) body.iso3_code = iso3Result;

  const continentResult = partialNullable(continentCode, originalContinentCode);
  if (continentResult !== UNSET) body.continent_code = continentResult;

  const flagImageResult = partialNullable(flagImageUrl, originalFlagImageUrl);
  if (flagImageResult !== UNSET) body.flag_image_url = flagImageResult;

  const currentIsActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (currentIsActive !== originalIsActive) {
    body.is_active = currentIsActive;
  }

  return {
    countryId,
    body,
  };
}
