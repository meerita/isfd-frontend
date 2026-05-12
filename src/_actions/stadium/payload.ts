/** @format */

import { parseStadiumSurfaceType } from '@/_constants/enums/stadium';
import { isUuid } from '@/_helpers/uuid';
import type {
  CreateStadiumRequest,
  StadiumActionState,
  StadiumSurfaceType,
  UpdateStadiumRequest,
} from '@/_types/stadium';

const INVALID_VALUE = Symbol('invalid-value');
const UNSET = Symbol('unset');

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function parseFormerNames(value: string): string[] {
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

function parseNullableInteger(
  value: string,
): number | null | typeof INVALID_VALUE {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return INVALID_VALUE;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return INVALID_VALUE;
  }

  return parsed;
}

function parseNullablePositiveNumber(
  value: string,
): number | null | typeof INVALID_VALUE {
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return INVALID_VALUE;
  }

  return parsed;
}

function parseNullableDate(value: string): string | null | typeof INVALID_VALUE {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : INVALID_VALUE;
}

function parseNullableBoolean(
  value: string,
): boolean | null | typeof INVALID_VALUE {
  if (!value) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return INVALID_VALUE;
}

function parseRequiredBoolean(value: string): boolean | typeof INVALID_VALUE {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return INVALID_VALUE;
}

function parseNullableSurfaceType(
  value: string,
): StadiumSurfaceType | null | typeof INVALID_VALUE {
  if (!value) return null;
  return parseStadiumSurfaceType(value) ?? INVALID_VALUE;
}

function arraysEqual(
  left: ReadonlyArray<string>,
  right: ReadonlyArray<string>,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function partialNullable<T>(current: T | null, original: T | null): T | null | typeof UNSET {
  return current === original ? UNSET : current;
}

function resolvedNullableNumber(
  value: number | null | symbol,
): number | null {
  return value === INVALID_VALUE || typeof value === 'symbol' ? null : value;
}

function resolvedNullableString(
  value: string | null | symbol,
): string | null {
  return value === INVALID_VALUE || typeof value === 'symbol' ? null : value;
}

function resolvedNullableBoolean(
  value: boolean | null | symbol,
): boolean | null {
  return value === INVALID_VALUE || typeof value === 'symbol' ? null : value;
}

function resolvedNullableSurface(
  value: StadiumSurfaceType | null | symbol,
): StadiumSurfaceType | null {
  return value === INVALID_VALUE || typeof value === 'symbol' ? null : value;
}

function formError(reason: string, message: string): StadiumActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function validateNullableUuid(
  value: string | null,
  reason: string,
  message: string,
): StadiumActionState | null {
  if (!value || isUuid(value)) return null;
  return formError(reason, message);
}

function validateNullableUrl(value: string | null): StadiumActionState | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return null;
    }
  } catch {
    return formError(
      'STADIUM_INVALID_OFFICIAL_WEBSITE_URL',
      'Enter a valid official website URL.',
    );
  }

  return formError(
    'STADIUM_INVALID_OFFICIAL_WEBSITE_URL',
    'Enter a valid official website URL.',
  );
}

function buildParsedFields(getValue: (key: string) => string) {
  const former_names = parseFormerNames(getValue('former_names'));
  const official_website_url = optionalString(getValue('official_website_url'));
  const country_id = optionalString(getValue('country_id'));
  const city_id = optionalString(getValue('city_id'));
  const primary_club_id = optionalString(getValue('primary_club_id'));
  const seat_count = parseNullableInteger(getValue('seat_count'));
  const surface_type = parseNullableSurfaceType(getValue('surface_type'));
  const pitch_length_meters = parseNullablePositiveNumber(
    getValue('pitch_length_meters'),
  );
  const pitch_width_meters = parseNullablePositiveNumber(
    getValue('pitch_width_meters'),
  );
  const opened_on = parseNullableDate(getValue('opened_on'));
  const closed_on = parseNullableDate(getValue('closed_on'));
  const is_indoor = parseNullableBoolean(getValue('is_indoor'));
  const is_roofed = parseNullableBoolean(getValue('is_roofed'));

  return {
    former_names,
    official_website_url,
    country_id,
    city_id,
    primary_club_id,
    seat_count,
    surface_type,
    pitch_length_meters,
    pitch_width_meters,
    opened_on,
    closed_on,
    is_indoor,
    is_roofed,
  };
}

function validateParsedFields(fields: ReturnType<typeof buildParsedFields>) {
  if (fields.city_id && !fields.country_id) {
    return formError(
      'STADIUM_CITY_REQUIRES_COUNTRY',
      'Select a country before selecting a city.',
    );
  }

  const invalidField = [
    fields.seat_count === INVALID_VALUE
      ? formError('STADIUM_INVALID_SEAT_COUNT', 'Enter a valid seat count.')
      : null,
    fields.surface_type === INVALID_VALUE
      ? formError(
          'STADIUM_INVALID_SURFACE_TYPE',
          'Select a valid surface type.',
        )
      : null,
    fields.pitch_length_meters === INVALID_VALUE
      ? formError('STADIUM_INVALID_PITCH_LENGTH', 'Enter a valid pitch length.')
      : null,
    fields.pitch_width_meters === INVALID_VALUE
      ? formError('STADIUM_INVALID_PITCH_WIDTH', 'Enter a valid pitch width.')
      : null,
    fields.opened_on === INVALID_VALUE
      ? formError('STADIUM_INVALID_OPENED_ON', 'Enter a valid opened on date.')
      : null,
    fields.closed_on === INVALID_VALUE
      ? formError('STADIUM_INVALID_CLOSED_ON', 'Enter a valid closed on date.')
      : null,
    fields.is_indoor === INVALID_VALUE
      ? formError('INVALID_REQUEST', 'Select a valid indoor value.')
      : null,
    fields.is_roofed === INVALID_VALUE
      ? formError('INVALID_REQUEST', 'Select a valid roofed value.')
      : null,
    validateNullableUuid(
      fields.country_id,
      'STADIUM_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
    validateNullableUuid(
      fields.city_id,
      'STADIUM_INVALID_CITY_ID',
      'Select a valid city.',
    ),
    validateNullableUuid(
      fields.primary_club_id,
      'STADIUM_INVALID_PRIMARY_CLUB_ID',
      'Enter a valid primary club UUID.',
    ),
    validateNullableUrl(fields.official_website_url),
  ].find(Boolean);

  return invalidField ?? null;
}

export function formatFormerNamesForInput(
  formerNames: ReadonlyArray<string> | null | undefined,
): string {
  return formerNames?.join('\n') ?? '';
}

export function formatNullableBooleanForInput(
  value: boolean | null | undefined,
): string {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return '';
}

export function buildCreateStadiumBody(
  formData: FormData,
): { body?: CreateStadiumRequest; error?: StadiumActionState } {
  const name = getString(formData, 'name');
  if (!name) {
    return {
      error: formError('STADIUM_NAME_REQUIRED', 'Stadium name is required.'),
    };
  }

  const fields = buildParsedFields(key => getString(formData, key));
  const is_public = parseRequiredBoolean(getString(formData, 'is_public'));

  if (is_public === INVALID_VALUE) {
    return {
      error: formError('INVALID_REQUEST', 'Select whether the stadium is public.'),
    };
  }

  const validationError = validateParsedFields(fields);
  if (validationError) {
    return { error: validationError };
  }

  return {
    body: {
      name,
      former_names: fields.former_names,
      official_website_url: fields.official_website_url,
      country_id: fields.country_id,
      city_id: fields.city_id,
      primary_club_id: fields.primary_club_id,
      seat_count: resolvedNullableNumber(fields.seat_count),
      surface_type: resolvedNullableSurface(fields.surface_type),
      pitch_length_meters: resolvedNullableNumber(fields.pitch_length_meters),
      pitch_width_meters: resolvedNullableNumber(fields.pitch_width_meters),
      opened_on: resolvedNullableString(fields.opened_on),
      closed_on: resolvedNullableString(fields.closed_on),
      is_indoor: resolvedNullableBoolean(fields.is_indoor),
      is_roofed: resolvedNullableBoolean(fields.is_roofed),
      is_public,
    },
  };
}

export function buildUpdateStadiumBody(formData: FormData): {
  body?: UpdateStadiumRequest;
  error?: StadiumActionState;
  stadiumId?: string;
} {
  const stadiumId = getString(formData, 'stadium_id');
  if (!stadiumId) {
    return {
      error: formError(
        'STADIUM_ID_REQUIRED',
        'Stadium identifier is required to update the record.',
      ),
    };
  }

  const currentName = getString(formData, 'name');
  const originalName = getString(formData, 'original_name');
  if (currentName !== originalName && !currentName) {
    return {
      stadiumId,
      error: formError('STADIUM_NAME_REQUIRED', 'Stadium name is required.'),
    };
  }

  const fields = buildParsedFields(key => getString(formData, key));
  const validationError = validateParsedFields(fields);
  if (validationError) {
    return { stadiumId, error: validationError };
  }

  const originalFields = buildParsedFields(key =>
    getString(formData, `original_${key}`),
  );

  const currentIsPublic = parseRequiredBoolean(getString(formData, 'is_public'));
  const originalIsPublic = parseRequiredBoolean(
    getString(formData, 'original_is_public'),
  );

  if (currentIsPublic === INVALID_VALUE || originalIsPublic === INVALID_VALUE) {
    return {
      stadiumId,
      error: formError('INVALID_REQUEST', 'Select whether the stadium is public.'),
    };
  }

  const body: Record<string, unknown> = {};

  if (currentName !== originalName) {
    body.name = currentName;
  }

  if (!arraysEqual(fields.former_names, originalFields.former_names)) {
    body.former_names = fields.former_names;
  }

  const nullableStringFields = [
    ['official_website_url', fields.official_website_url, originalFields.official_website_url],
    ['country_id', fields.country_id, originalFields.country_id],
    ['city_id', fields.city_id, originalFields.city_id],
    ['primary_club_id', fields.primary_club_id, originalFields.primary_club_id],
  ] as const;

  for (const [key, current, original] of nullableStringFields) {
    const value = partialNullable(current, original);
    if (value !== UNSET) {
      body[key] = value;
    }
  }

  const nullableNumberFields = [
    ['seat_count', fields.seat_count, originalFields.seat_count],
    ['pitch_length_meters', fields.pitch_length_meters, originalFields.pitch_length_meters],
    ['pitch_width_meters', fields.pitch_width_meters, originalFields.pitch_width_meters],
  ] as const;

  for (const [key, currentRaw, originalRaw] of nullableNumberFields) {
    const current = resolvedNullableNumber(currentRaw);
    const original = resolvedNullableNumber(originalRaw);
    const value = partialNullable(current, original);
    if (value !== UNSET) {
      body[key] = value;
    }
  }

  const nullableDateFields = [
    ['opened_on', fields.opened_on, originalFields.opened_on],
    ['closed_on', fields.closed_on, originalFields.closed_on],
  ] as const;

  for (const [key, currentRaw, originalRaw] of nullableDateFields) {
    const current = resolvedNullableString(currentRaw);
    const original = resolvedNullableString(originalRaw);
    const value = partialNullable(current, original);
    if (value !== UNSET) {
      body[key] = value;
    }
  }

  const nullableBooleanFields = [
    ['is_indoor', fields.is_indoor, originalFields.is_indoor],
    ['is_roofed', fields.is_roofed, originalFields.is_roofed],
  ] as const;

  for (const [key, currentRaw, originalRaw] of nullableBooleanFields) {
    const current = resolvedNullableBoolean(currentRaw);
    const original = resolvedNullableBoolean(originalRaw);
    const value = partialNullable(current, original);
    if (value !== UNSET) {
      body[key] = value;
    }
  }

  const currentSurface = resolvedNullableSurface(fields.surface_type);
  const originalSurface = resolvedNullableSurface(originalFields.surface_type);
  const surfaceValue = partialNullable(currentSurface, originalSurface);
  if (surfaceValue !== UNSET) {
    body.surface_type = surfaceValue;
  }

  if (currentIsPublic !== originalIsPublic) {
    body.is_public = currentIsPublic;
  }

  return { stadiumId, body: body as UpdateStadiumRequest };
}
