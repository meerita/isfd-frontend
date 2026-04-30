/** @format */

import type { PersonActionState } from '@/_types/person';

const UNSET = Symbol('unset');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type NullableStringFieldKey =
  | 'first_name'
  | 'middle_name'
  | 'last_name'
  | 'second_surname'
  | 'display_name'
  | 'known_as'
  | 'native_full_name'
  | 'gender'
  | 'birth_location_id'
  | 'primary_nationality_country_id'
  | 'hair_color'
  | 'ethnicity'
  | 'skin_color'
  | 'dominant_foot'
  | 'current_profession'
  | 'avatar_image_url'
  | 'hero_image_url';

type NullableDateFieldKey =
  | 'birth_date'
  | 'death_date'
  | 'professional_division_debut_date'
  | 'retirement_date';

type NullableNumberFieldKey = 'height_cm' | 'weight_kg';

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

function formatDateForComparison(value: string | null): string | null {
  if (!value) return null;

  const normalized = normalizeDateInput(value);
  return normalized ?? value;
}

function parseNullableNumber(
  value: string,
): number | null | typeof Number.NaN {
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Number.NaN;

  return parsed;
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
): PersonActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
}

function validateNullableUrl(
  value: string | null,
  reason: string,
  message: string,
): PersonActionState | null {
  if (!value || isValidHttpUrl(value)) return null;
  return formError(reason, message, message);
}

function validateNullableNumber(
  value: number | null,
  reason: string,
  message: string,
): PersonActionState | null {
  if (value === null) return null;
  if (value > 0) return null;
  return formError(reason, message, message);
}

function validateDateRelationships(
  birthDate: string | null,
  deathDate: string | null,
  isDeceased: boolean,
  debutDate: string | null,
  retirementDate: string | null,
): PersonActionState | null {
  if (birthDate && isFutureDate(birthDate)) {
    return formError(
      'PERSON_BIRTH_DATE_IN_FUTURE',
      'Birth date cannot be in the future.',
      'Birth date cannot be in the future.',
    );
  }

  if (deathDate && isFutureDate(deathDate)) {
    return formError(
      'PERSON_DEATH_DATE_IN_FUTURE',
      'Death date cannot be in the future.',
      'Death date cannot be in the future.',
    );
  }

  if (deathDate && !isDeceased) {
    return formError(
      'PERSON_DEATH_DATE_REQUIRES_DECEASED',
      'Death date requires the person to be deceased.',
      'Set the person as deceased before adding a death date.',
    );
  }

  if (birthDate && deathDate && deathDate < birthDate) {
    return formError(
      'PERSON_DEATH_DATE_BEFORE_BIRTH_DATE',
      'Death date cannot be before birth date.',
      'Death date cannot be before birth date.',
    );
  }

  if (debutDate && isFutureDate(debutDate)) {
    return formError(
      'PERSON_PROFESSIONAL_DEBUT_DATE_IN_FUTURE',
      'Professional debut date cannot be in the future.',
      'Professional debut date cannot be in the future.',
    );
  }

  if (retirementDate && isFutureDate(retirementDate)) {
    return formError(
      'PERSON_RETIREMENT_DATE_IN_FUTURE',
      'Retirement date cannot be in the future.',
      'Retirement date cannot be in the future.',
    );
  }

  if (debutDate && retirementDate && retirementDate < debutDate) {
    return formError(
      'PERSON_RETIREMENT_DATE_BEFORE_DEBUT_DATE',
      'Retirement date cannot be before professional debut date.',
      'Retirement date cannot be before professional debut date.',
    );
  }

  return null;
}

function partialNullable<T>(
  value: T | null,
  original: T | null,
): T | null | typeof UNSET {
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

export function buildCreatePersonBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: PersonActionState } {
  const fullName = str(formData, 'fullName');
  if (!fullName) {
    return {
      error: formError(
        'PERSON_FULL_NAME_REQUIRED',
        'Full name is required.',
        'Full name is required.',
      ),
    };
  }

  const birthDateRaw = str(formData, 'birthDate');
  const deathDateRaw = str(formData, 'deathDate');
  const debutDateRaw = str(formData, 'professionalDivisionDebutDate');
  const retirementDateRaw = str(formData, 'retirementDate');
  const birthDate = normalizeDateInput(birthDateRaw);
  const deathDate = normalizeDateInput(deathDateRaw);
  const debutDate = normalizeDateInput(debutDateRaw);
  const retirementDate = normalizeDateInput(retirementDateRaw);
  const isDeceased = bool(formData, 'isDeceased', false);
  const heightCm = parseNullableNumber(str(formData, 'heightCm'));
  const weightKg = parseNullableNumber(str(formData, 'weightKg'));

  if (birthDateRaw && !birthDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Birth date must use YYYY-MM-DD.',
        'Enter a valid birth date in YYYY-MM-DD format.',
      ),
    };
  }

  if (deathDateRaw && !deathDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Death date must use YYYY-MM-DD.',
        'Enter a valid death date in YYYY-MM-DD format.',
      ),
    };
  }

  if (debutDateRaw && !debutDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Professional debut date must use YYYY-MM-DD.',
        'Enter a valid professional debut date in YYYY-MM-DD format.',
      ),
    };
  }

  if (retirementDateRaw && !retirementDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Retirement date must use YYYY-MM-DD.',
        'Enter a valid retirement date in YYYY-MM-DD format.',
      ),
    };
  }

  if (Number.isNaN(heightCm)) {
    return {
      error: formError(
        'PERSON_INVALID_HEIGHT_CM',
        'Height must be a valid number.',
        'Enter a valid height in centimeters.',
      ),
    };
  }

  if (Number.isNaN(weightKg)) {
    return {
      error: formError(
        'PERSON_INVALID_WEIGHT_KG',
        'Weight must be a valid number.',
        'Enter a valid weight in kilograms.',
      ),
    };
  }

  const validations = [
    validateNullableUrl(
      optionalString(str(formData, 'avatarImageUrl')),
      'PERSON_INVALID_AVATAR_IMAGE_URL',
      'Enter a valid avatar image URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'heroImageUrl')),
      'PERSON_INVALID_HERO_IMAGE_URL',
      'Enter a valid hero image URL.',
    ),
    validateNullableNumber(
      heightCm,
      'PERSON_INVALID_HEIGHT_CM',
      'Enter a valid height in centimeters.',
    ),
    validateNullableNumber(
      weightKg,
      'PERSON_INVALID_WEIGHT_KG',
      'Enter a valid weight in kilograms.',
    ),
    validateDateRelationships(
      birthDate,
      deathDate,
      isDeceased,
      debutDate,
      retirementDate,
    ),
  ];

  const validationError = validations.find(Boolean);
  if (validationError) {
    return { error: validationError };
  }

  const body: Record<string, unknown> = {
    full_name: fullName,
    is_deceased: isDeceased,
    is_active: bool(formData, 'isActive', true),
  };

  const nullableStringFields: ReadonlyArray<
    Readonly<{
      formKey: string;
      bodyKey: NullableStringFieldKey;
    }>
  > = [
    { formKey: 'firstName', bodyKey: 'first_name' },
    { formKey: 'middleName', bodyKey: 'middle_name' },
    { formKey: 'lastName', bodyKey: 'last_name' },
    { formKey: 'secondSurname', bodyKey: 'second_surname' },
    { formKey: 'displayName', bodyKey: 'display_name' },
    { formKey: 'knownAs', bodyKey: 'known_as' },
    { formKey: 'nativeFullName', bodyKey: 'native_full_name' },
    { formKey: 'gender', bodyKey: 'gender' },
    { formKey: 'birthLocationId', bodyKey: 'birth_location_id' },
    {
      formKey: 'primaryNationalityCountryId',
      bodyKey: 'primary_nationality_country_id',
    },
    { formKey: 'hairColor', bodyKey: 'hair_color' },
    { formKey: 'ethnicity', bodyKey: 'ethnicity' },
    { formKey: 'skinColor', bodyKey: 'skin_color' },
    { formKey: 'dominantFoot', bodyKey: 'dominant_foot' },
    { formKey: 'currentProfession', bodyKey: 'current_profession' },
    { formKey: 'avatarImageUrl', bodyKey: 'avatar_image_url' },
    { formKey: 'heroImageUrl', bodyKey: 'hero_image_url' },
  ];

  for (const field of nullableStringFields) {
    const value = optionalString(str(formData, field.formKey));
    if (value !== null) {
      body[field.bodyKey] = value;
    }
  }

  const nullableDateFields: ReadonlyArray<
    Readonly<{
      bodyKey: NullableDateFieldKey;
      value: string | null;
    }>
  > = [
    { bodyKey: 'birth_date', value: birthDate },
    { bodyKey: 'death_date', value: deathDate },
    {
      bodyKey: 'professional_division_debut_date',
      value: debutDate,
    },
    { bodyKey: 'retirement_date', value: retirementDate },
  ];

  for (const field of nullableDateFields) {
    if (field.value !== null) {
      body[field.bodyKey] = field.value;
    }
  }

  const nullableNumberFields: ReadonlyArray<
    Readonly<{
      bodyKey: NullableNumberFieldKey;
      value: number | null;
    }>
  > = [
    { bodyKey: 'height_cm', value: heightCm },
    { bodyKey: 'weight_kg', value: weightKg },
  ];

  for (const field of nullableNumberFields) {
    if (field.value !== null) {
      body[field.bodyKey] = field.value;
    }
  }

  return { body };
}

export function buildUpdatePersonBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: PersonActionState;
  personId?: string;
} {
  const personId = str(formData, 'personId');
  if (!personId) {
    return {
      error: formError(
        'PERSON_ID_REQUIRED',
        'Missing person identifier.',
        'Person identifier is required to update the record.',
      ),
    };
  }

  const fullName = str(formData, 'fullName');
  const originalFullName = str(formData, 'original_fullName');
  const fullNameResult = partialRequired(fullName, originalFullName);
  if (fullNameResult !== UNSET && !fullNameResult) {
    return {
      personId,
      error: formError(
        'PERSON_FULL_NAME_REQUIRED',
        'Full name is required.',
        'Full name is required.',
      ),
    };
  }

  const birthDateRaw = str(formData, 'birthDate');
  const deathDateRaw = str(formData, 'deathDate');
  const debutDateRaw = str(formData, 'professionalDivisionDebutDate');
  const retirementDateRaw = str(formData, 'retirementDate');
  const birthDate = normalizeDateInput(birthDateRaw);
  const deathDate = normalizeDateInput(deathDateRaw);
  const debutDate = normalizeDateInput(debutDateRaw);
  const retirementDate = normalizeDateInput(retirementDateRaw);
  const originalBirthDate = formatDateForComparison(
    optionalString(str(formData, 'original_birthDate')),
  );
  const originalDeathDate = formatDateForComparison(
    optionalString(str(formData, 'original_deathDate')),
  );
  const originalDebutDate = formatDateForComparison(
    optionalString(str(formData, 'original_professionalDivisionDebutDate')),
  );
  const originalRetirementDate = formatDateForComparison(
    optionalString(str(formData, 'original_retirementDate')),
  );
  const currentIsDeceased = bool(formData, 'isDeceased', false);
  const originalIsDeceased = bool(formData, 'original_isDeceased', false);
  const currentDeathDate = currentIsDeceased ? deathDate : null;
  const effectiveBirthDate = birthDate ?? originalBirthDate;
  const effectiveDeathDate = currentIsDeceased
    ? deathDate ?? originalDeathDate
    : null;
  const effectiveDebutDate = debutDate ?? originalDebutDate;
  const effectiveRetirementDate = retirementDate ?? originalRetirementDate;
  const heightCm = parseNullableNumber(str(formData, 'heightCm'));
  const weightKg = parseNullableNumber(str(formData, 'weightKg'));

  if (birthDateRaw && !birthDate) {
    return {
      personId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Birth date must use YYYY-MM-DD.',
        'Enter a valid birth date in YYYY-MM-DD format.',
      ),
    };
  }

  if (deathDateRaw && !deathDate) {
    return {
      personId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Death date must use YYYY-MM-DD.',
        'Enter a valid death date in YYYY-MM-DD format.',
      ),
    };
  }

  if (debutDateRaw && !debutDate) {
    return {
      personId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Professional debut date must use YYYY-MM-DD.',
        'Enter a valid professional debut date in YYYY-MM-DD format.',
      ),
    };
  }

  if (retirementDateRaw && !retirementDate) {
    return {
      personId,
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Retirement date must use YYYY-MM-DD.',
        'Enter a valid retirement date in YYYY-MM-DD format.',
      ),
    };
  }

  if (Number.isNaN(heightCm)) {
    return {
      personId,
      error: formError(
        'PERSON_INVALID_HEIGHT_CM',
        'Height must be a valid number.',
        'Enter a valid height in centimeters.',
      ),
    };
  }

  if (Number.isNaN(weightKg)) {
    return {
      personId,
      error: formError(
        'PERSON_INVALID_WEIGHT_KG',
        'Weight must be a valid number.',
        'Enter a valid weight in kilograms.',
      ),
    };
  }

  const validations = [
    validateNullableUrl(
      optionalString(str(formData, 'avatarImageUrl')),
      'PERSON_INVALID_AVATAR_IMAGE_URL',
      'Enter a valid avatar image URL.',
    ),
    validateNullableUrl(
      optionalString(str(formData, 'heroImageUrl')),
      'PERSON_INVALID_HERO_IMAGE_URL',
      'Enter a valid hero image URL.',
    ),
    validateNullableNumber(
      heightCm,
      'PERSON_INVALID_HEIGHT_CM',
      'Enter a valid height in centimeters.',
    ),
    validateNullableNumber(
      weightKg,
      'PERSON_INVALID_WEIGHT_KG',
      'Enter a valid weight in kilograms.',
    ),
    validateDateRelationships(
      effectiveBirthDate,
      effectiveDeathDate,
      currentIsDeceased,
      effectiveDebutDate,
      effectiveRetirementDate,
    ),
  ];

  const validationError = validations.find(Boolean);
  if (validationError) {
    return { personId, error: validationError };
  }

  const body: Record<string, unknown> = {};

  if (fullNameResult !== UNSET) {
    body.full_name = fullNameResult;
  }

  const nullableStringFields: ReadonlyArray<
    Readonly<{
      formKey: string;
      originalKey: string;
      bodyKey: NullableStringFieldKey;
    }>
  > = [
    { formKey: 'firstName', originalKey: 'original_firstName', bodyKey: 'first_name' },
    {
      formKey: 'middleName',
      originalKey: 'original_middleName',
      bodyKey: 'middle_name',
    },
    { formKey: 'lastName', originalKey: 'original_lastName', bodyKey: 'last_name' },
    {
      formKey: 'secondSurname',
      originalKey: 'original_secondSurname',
      bodyKey: 'second_surname',
    },
    {
      formKey: 'displayName',
      originalKey: 'original_displayName',
      bodyKey: 'display_name',
    },
    { formKey: 'knownAs', originalKey: 'original_knownAs', bodyKey: 'known_as' },
    {
      formKey: 'nativeFullName',
      originalKey: 'original_nativeFullName',
      bodyKey: 'native_full_name',
    },
    { formKey: 'gender', originalKey: 'original_gender', bodyKey: 'gender' },
    {
      formKey: 'birthLocationId',
      originalKey: 'original_birthLocationId',
      bodyKey: 'birth_location_id',
    },
    {
      formKey: 'primaryNationalityCountryId',
      originalKey: 'original_primaryNationalityCountryId',
      bodyKey: 'primary_nationality_country_id',
    },
    {
      formKey: 'hairColor',
      originalKey: 'original_hairColor',
      bodyKey: 'hair_color',
    },
    {
      formKey: 'ethnicity',
      originalKey: 'original_ethnicity',
      bodyKey: 'ethnicity',
    },
    {
      formKey: 'skinColor',
      originalKey: 'original_skinColor',
      bodyKey: 'skin_color',
    },
    {
      formKey: 'dominantFoot',
      originalKey: 'original_dominantFoot',
      bodyKey: 'dominant_foot',
    },
    {
      formKey: 'currentProfession',
      originalKey: 'original_currentProfession',
      bodyKey: 'current_profession',
    },
    {
      formKey: 'avatarImageUrl',
      originalKey: 'original_avatarImageUrl',
      bodyKey: 'avatar_image_url',
    },
    {
      formKey: 'heroImageUrl',
      originalKey: 'original_heroImageUrl',
      bodyKey: 'hero_image_url',
    },
  ];

  for (const field of nullableStringFields) {
    const currentValue = optionalString(str(formData, field.formKey));
    const originalValue = optionalString(str(formData, field.originalKey));
    const result = partialNullable(currentValue, originalValue);
    if (result !== UNSET) {
      body[field.bodyKey] = result;
    }
  }

  const birthDateResult = partialNullable(birthDate, originalBirthDate);
  if (birthDateResult !== UNSET) {
    body.birth_date = birthDateResult;
  }

  if (!currentIsDeceased) {
    if (originalDeathDate !== null || deathDateRaw) {
      body.death_date = null;
    }
  } else {
    const deathDateResult = partialNullable(currentDeathDate, originalDeathDate);
    if (deathDateResult !== UNSET) {
      body.death_date = deathDateResult;
    }
  }

  const debutDateResult = partialNullable(debutDate, originalDebutDate);
  if (debutDateResult !== UNSET) {
    body.professional_division_debut_date = debutDateResult;
  }

  const retirementDateResult = partialNullable(
    retirementDate,
    originalRetirementDate,
  );
  if (retirementDateResult !== UNSET) {
    body.retirement_date = retirementDateResult;
  }

  const originalHeightCm = parseNullableNumber(str(formData, 'original_heightCm'));
  const originalWeightKg = parseNullableNumber(str(formData, 'original_weightKg'));

  const heightResult = partialNullable(heightCm, originalHeightCm);
  if (heightResult !== UNSET) {
    body.height_cm = heightResult;
  }

  const weightResult = partialNullable(weightKg, originalWeightKg);
  if (weightResult !== UNSET) {
    body.weight_kg = weightResult;
  }

  if (currentIsDeceased !== originalIsDeceased) {
    body.is_deceased = currentIsDeceased;
  }

  const currentIsActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (currentIsActive !== originalIsActive) {
    body.is_active = currentIsActive;
  }

  if (Object.keys(body).length === 0) {
    return { personId, body: {} };
  }

  return { personId, body };
}
