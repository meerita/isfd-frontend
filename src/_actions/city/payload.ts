/** @format */

import type { CityActionState } from '@/_types/city';

const UNSET = Symbol('unset');
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function normalizeNumericInput(value: string): string {
  return value
    .trim()
    .replaceAll(/\s+/g, '')
    .replaceAll('\u2212', '-')
    .replaceAll(',', '.');
}

function parseOptionalNumber(value: string): {
  value: number | null;
  valid: boolean;
} {
  const normalized = normalizeNumericInput(value);
  if (!normalized) {
    return {
      value: null,
      valid: true,
    };
  }

  const parsed = Number(normalized);
  return {
    value: Number.isFinite(parsed) ? parsed : null,
    valid: Number.isFinite(parsed),
  };
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function formError(reason: string, message: string, error: string): CityActionState {
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

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  if (Object.is(value, original)) return UNSET;
  return value;
}

function validateLatitude(value: number | null): CityActionState | null {
  if (value === null || (value >= -90 && value <= 90)) return null;

  return formError(
    'CITY_INVALID_LATITUDE',
    'Latitude must be between -90 and 90.',
    'Latitude must be between -90 and 90.',
  );
}

function validateLongitude(value: number | null): CityActionState | null {
  if (value === null || (value >= -180 && value <= 180)) return null;

  return formError(
    'CITY_INVALID_LONGITUDE',
    'Longitude must be between -180 and 180.',
    'Longitude must be between -180 and 180.',
  );
}

export function buildCreateCityBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: CityActionState } {
  const countryId = str(formData, 'countryId');
  if (!countryId) {
    return {
      error: formError(
        'CITY_COUNTRY_ID_REQUIRED',
        'Country is required.',
        'Select a country.',
      ),
    };
  }

  if (!isValidUuid(countryId)) {
    return {
      error: formError(
        'CITY_COUNTRY_ID_INVALID',
        'Country identifier is invalid.',
        'Select a valid country.',
      ),
    };
  }

  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'CITY_NAME_REQUIRED',
        'City name is required.',
        'City name is required.',
      ),
    };
  }

  return {
    body: {
      country_id: countryId,
      name,
    },
  };
}

export function buildUpdateCityBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: CityActionState;
  cityId?: string;
  countryId?: string;
  originalCountryId?: string;
} {
  const cityId = str(formData, 'cityId');
  if (!cityId) {
    return {
      error: formError(
        'CITY_ID_REQUIRED',
        'Missing city identifier.',
        'City identifier is required to update the record.',
      ),
    };
  }

  const countryId = str(formData, 'countryId');
  const originalCountryId = optionalString(str(formData, 'original_countryId'));
  if (!countryId) {
    return {
      cityId,
      originalCountryId: originalCountryId ?? undefined,
      error: formError(
        'CITY_COUNTRY_ID_REQUIRED',
        'Country is required.',
        'Select a country.',
      ),
    };
  }

  if (!isValidUuid(countryId)) {
    return {
      cityId,
      originalCountryId: originalCountryId ?? undefined,
      error: formError(
        'CITY_COUNTRY_ID_INVALID',
        'Country identifier is invalid.',
        'Select a valid country.',
      ),
    };
  }

  const name = str(formData, 'name');
  const originalName = str(formData, 'original_name');
  const nameResult = partialRequired(name, originalName);
  if (nameResult !== UNSET && !nameResult) {
    return {
      cityId,
      countryId,
      originalCountryId: originalCountryId ?? undefined,
      error: formError(
        'CITY_NAME_REQUIRED',
        'City name is required.',
        'City name is required.',
      ),
    };
  }

  const regionName = optionalString(str(formData, 'regionName'));
  const provinceName = optionalString(str(formData, 'provinceName'));
  const originalRegionName = optionalString(str(formData, 'original_regionName'));
  const originalProvinceName = optionalString(
    str(formData, 'original_provinceName'),
  );
  const latitudeResult = parseOptionalNumber(str(formData, 'latitude'));
  const longitudeResult = parseOptionalNumber(str(formData, 'longitude'));
  const originalLatitude = parseOptionalNumber(str(formData, 'original_latitude'));
  const originalLongitude = parseOptionalNumber(
    str(formData, 'original_longitude'),
  );

  if (
    !latitudeResult.valid ||
    !longitudeResult.valid ||
    !originalLatitude.valid ||
    !originalLongitude.valid
  ) {
    return {
      cityId,
      countryId,
      originalCountryId: originalCountryId ?? undefined,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Coordinates must be valid numbers.',
        'Enter valid numeric coordinates.',
      ),
    };
  }

  const validationError = [
    validateLatitude(latitudeResult.value),
    validateLongitude(longitudeResult.value),
  ].find(Boolean);

  if (validationError) {
    return {
      cityId,
      countryId,
      originalCountryId: originalCountryId ?? undefined,
      error: validationError,
    };
  }

  const body: Record<string, unknown> = {};

  const countryResult = partialRequired(countryId, originalCountryId ?? '');
  if (countryResult !== UNSET) {
    body.country_id = countryResult;
  }

  if (nameResult !== UNSET) {
    body.name = nameResult;
  }

  const regionResult = partialNullable(regionName, originalRegionName);
  if (regionResult !== UNSET) body.region_name = regionResult;

  const provinceResult = partialNullable(provinceName, originalProvinceName);
  if (provinceResult !== UNSET) body.province_name = provinceResult;

  const latitudeValue = partialNullableNumber(
    latitudeResult.value,
    originalLatitude.value,
  );
  if (latitudeValue !== UNSET) body.latitude = latitudeValue;

  const longitudeValue = partialNullableNumber(
    longitudeResult.value,
    originalLongitude.value,
  );
  if (longitudeValue !== UNSET) body.longitude = longitudeValue;

  const currentIsActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (currentIsActive !== originalIsActive) {
    body.is_public = currentIsActive;
  }

  return {
    cityId,
    countryId,
    originalCountryId: originalCountryId ?? undefined,
    body,
  };
}
