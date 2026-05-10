/** @format */

import {
  parseStadiumSurfaceType,
  STADIUM_SURFACE_TYPES,
  type StadiumSurfaceType,
} from '@/_constants/enums/stadium';
import { isUuid } from '@/_helpers/uuid';
import {
  type StadiumActionState,
} from '@/_types/stadium';

const INVALID_NUMBER = Symbol('invalid-number');

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

function optionalSurfaceType(value: string): StadiumSurfaceType | null {
  if (!value) return null;

  return parseStadiumSurfaceType(value);
}

function parseFormerNames(value: string): ReadonlyArray<string> {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map(entry => entry.trim())
        .filter(Boolean),
    ),
  );
}

function parseSeatCount(value: string): number | null | typeof INVALID_NUMBER {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return INVALID_NUMBER;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : INVALID_NUMBER;
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
): StadiumActionState {
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
): StadiumActionState | null {
  if (!value || isUuid(value)) return null;
  return formError(reason, message, message);
}

function validateNullableUrl(
  value: string | null,
  reason: string,
  message: string,
): StadiumActionState | null {
  if (!value || isValidHttpUrl(value)) return null;
  return formError(reason, message, message);
}

function validateSurfaceType(value: string): StadiumActionState | null {
  if (!value) return null;

  if (STADIUM_SURFACE_TYPES.includes(value as StadiumSurfaceType)) return null;

  return formError(
    'STADIUM_INVALID_SURFACE_TYPE',
    'Select a valid surface type.',
    'Select a valid surface type.',
  );
}

export function formatFormerNamesForInput(
  formerNames: ReadonlyArray<string> | null | undefined,
): string {
  return formerNames?.join('\n') ?? '';
}

export function buildCreateStadiumBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: StadiumActionState } {
  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'STADIUM_NAME_REQUIRED',
        'Stadium name is required.',
        'Stadium name is required.',
      ),
    };
  }

  const countryId = optionalString(str(formData, 'countryId'));
  const cityId = optionalString(str(formData, 'cityId'));
  const primaryClubId = optionalString(str(formData, 'primaryClubId'));
  const imageUrl = optionalString(str(formData, 'imageUrl'));
  const rawSurfaceType = str(formData, 'surfaceType');
  const surfaceType = optionalSurfaceType(rawSurfaceType);
  const formerNames = parseFormerNames(str(formData, 'formerNames'));
  const seatCount = parseSeatCount(str(formData, 'seatCount'));

  if (cityId && !countryId) {
    return {
      error: formError(
        'STADIUM_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  if (seatCount === INVALID_NUMBER) {
    return {
      error: formError(
        'STADIUM_INVALID_SEAT_COUNT',
        'Seat count must be a whole number.',
        'Enter a valid seat count.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      countryId,
      'STADIUM_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      cityId,
      'STADIUM_INVALID_CITY_ID',
      'Select a valid city.',
    ),
    validateNullableUuid(
      primaryClubId,
      'STADIUM_INVALID_PRIMARY_CLUB_ID',
      'Enter a valid primary club UUID.',
    ),
    validateNullableUrl(
      imageUrl,
      'STADIUM_INVALID_IMAGE_URL',
      'Enter a valid image URL.',
    ),
    validateSurfaceType(rawSurfaceType),
  ].find(Boolean);

  if (validationError) {
    return { error: validationError };
  }

  const body: Record<string, unknown> = {
    name,
    is_public: bool(formData, 'isActive', true),
  };

  if (formerNames.length > 0) body.former_names = formerNames;
  if (countryId !== null) body.country_id = countryId;
  if (countryId !== null && cityId !== null) body.city_id = cityId;
  if (primaryClubId !== null) body.primary_club_id = primaryClubId;
  if (imageUrl !== null) body.image_url = imageUrl;
  if (seatCount !== null) body.seat_count = seatCount;
  if (surfaceType !== null) body.surface_type = surfaceType;

  return { body };
}

export function buildUpdateStadiumBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: StadiumActionState;
  stadiumId?: string;
} {
  const stadiumId = str(formData, 'stadiumId');
  if (!stadiumId) {
    return {
      error: formError(
        'STADIUM_ID_REQUIRED',
        'Missing stadium identifier.',
        'Stadium identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  if (!name) {
    return {
      stadiumId,
      error: formError(
        'STADIUM_NAME_REQUIRED',
        'Stadium name is required.',
        'Stadium name is required.',
      ),
    };
  }

  const countryId = optionalString(str(formData, 'countryId'));
  const cityId = optionalString(str(formData, 'cityId'));
  const primaryClubId = optionalString(str(formData, 'primaryClubId'));
  const imageUrl = optionalString(str(formData, 'imageUrl'));
  const rawSurfaceType = str(formData, 'surfaceType');
  const surfaceType = optionalSurfaceType(rawSurfaceType);
  const originalSurfaceType = optionalSurfaceType(str(formData, 'original_surfaceType'));
  const formerNames = parseFormerNames(str(formData, 'formerNames'));
  const seatCount = parseSeatCount(str(formData, 'seatCount'));

  if (cityId && !countryId) {
    return {
      stadiumId,
      error: formError(
        'STADIUM_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  if (seatCount === INVALID_NUMBER) {
    return {
      stadiumId,
      error: formError(
        'STADIUM_INVALID_SEAT_COUNT',
        'Seat count must be a whole number.',
        'Enter a valid seat count.',
      ),
    };
  }

  const validationError = [
    validateNullableUuid(
      countryId,
      'STADIUM_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      cityId,
      'STADIUM_INVALID_CITY_ID',
      'Select a valid city.',
    ),
    validateNullableUuid(
      primaryClubId,
      'STADIUM_INVALID_PRIMARY_CLUB_ID',
      'Enter a valid primary club UUID.',
    ),
    validateNullableUrl(
      imageUrl,
      'STADIUM_INVALID_IMAGE_URL',
      'Enter a valid image URL.',
    ),
    validateSurfaceType(rawSurfaceType),
  ].find(Boolean);

  if (validationError) {
    return { stadiumId, error: validationError };
  }

  const body: Record<string, unknown> = {
    name,
    former_names: formerNames,
    country_id: countryId,
    city_id: countryId ? cityId : null,
    primary_club_id: primaryClubId,
    image_url: imageUrl,
    seat_count: seatCount,
    is_public: bool(formData, 'isActive', false),
  };

  if (surfaceType !== originalSurfaceType) {
    body.surface_type = surfaceType;
  }

  return { stadiumId, body };
}
