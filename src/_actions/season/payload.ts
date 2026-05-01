/** @format */

import type { SeasonActionState } from '@/_types/season';

const UNSET = Symbol('unset');
const CODE_PATTERN = /^[A-Z0-9_]+$/;

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

function parseYear(value: string): number | null {
  if (!value) return null;
  if (!/^\d{4}$/.test(value)) return null;
  return Number(value);
}

function formError(reason: string, message: string): SeasonActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function partialRequired(value: string, original: string): string | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  return value === original ? UNSET : value;
}

function validateYearRange(
  startYear: number,
  endYear: number | null,
): SeasonActionState | null {
  if (endYear !== null && endYear < startYear) {
    return formError(
      'SEASON_INVALID_YEAR_RANGE',
      'End year cannot be before start year.',
    );
  }

  return null;
}

export function buildCreateSeasonBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: SeasonActionState } {
  const code = str(formData, 'code');
  const name = str(formData, 'name');
  const startYear = parseYear(str(formData, 'startYear'));
  const rawEndYear = str(formData, 'endYear');
  const endYear = parseYear(rawEndYear);

  if (!code) {
    return { error: formError('SEASON_CODE_REQUIRED', 'Season code is required.') };
  }

  if (!CODE_PATTERN.test(code)) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Season code must use A-Z, 0-9, and _.',
      ),
    };
  }

  if (!name) {
    return { error: formError('SEASON_NAME_REQUIRED', 'Season name is required.') };
  }

  if (startYear === null) {
    return {
      error: formError('SEASON_INVALID_START_YEAR', 'Enter a valid start year.'),
    };
  }

  if (rawEndYear && endYear === null) {
    return {
      error: formError('SEASON_INVALID_END_YEAR', 'Enter a valid end year.'),
    };
  }

  const validationError = validateYearRange(startYear, endYear);
  if (validationError) return { error: validationError };

  return {
    body: {
      code,
      name,
      start_year: startYear,
      end_year: endYear,
      is_active: bool(formData, 'isActive', true),
    },
  };
}

export function buildUpdateSeasonBody(
  formData: FormData,
): {
  body?: Record<string, unknown>;
  error?: SeasonActionState;
  seasonId?: string;
} {
  const seasonId = str(formData, 'seasonId');
  if (!seasonId) {
    return {
      error: formError('SEASON_ID_REQUIRED', 'Season identifier is required.'),
    };
  }

  const name = str(formData, 'name');
  const startYear = parseYear(str(formData, 'startYear'));
  const rawEndYear = str(formData, 'endYear');
  const endYear = parseYear(rawEndYear);

  if (!name) {
    return {
      seasonId,
      error: formError('SEASON_NAME_REQUIRED', 'Season name is required.'),
    };
  }

  if (startYear === null) {
    return {
      seasonId,
      error: formError('SEASON_INVALID_START_YEAR', 'Enter a valid start year.'),
    };
  }

  if (rawEndYear && endYear === null) {
    return {
      seasonId,
      error: formError('SEASON_INVALID_END_YEAR', 'Enter a valid end year.'),
    };
  }

  const validationError = validateYearRange(startYear, endYear);
  if (validationError) return { seasonId, error: validationError };

  const body: Record<string, unknown> = {};
  const nameResult = partialRequired(name, str(formData, 'original_name'));
  const startYearResult = partialNullableNumber(
    startYear,
    parseYear(str(formData, 'original_startYear')),
  );
  const endYearResult = partialNullableNumber(
    endYear,
    parseYear(str(formData, 'original_endYear')),
  );

  if (nameResult !== UNSET) body.name = nameResult;
  if (startYearResult !== UNSET) body.start_year = startYearResult;
  if (endYearResult !== UNSET) body.end_year = endYearResult;

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_active = isActive;
  }

  return { seasonId, body };
}
