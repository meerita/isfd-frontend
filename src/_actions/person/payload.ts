/** @format */

import {
  parsePersonCurrentProfession,
  parsePersonDominantFoot,
  parsePersonEthnicity,
  parsePersonGender,
  parsePersonHairColor,
  parsePersonSkinColor,
  type PersonCurrentProfession,
  type PersonDominantFoot,
  type PersonEthnicity,
  type PersonGender,
  type PersonHairColor,
  type PersonSkinColor,
} from '@/_constants/enums/person';
import type {
  CreatePersonRequest,
  PersonActionState,
  UpdatePersonRequest,
} from '@/_types/person';

const UNSET = Symbol('unset');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_FULL_NAME_LENGTH = 200;
const MAX_DISPLAY_NAME_LENGTH = 200;
const MAX_SHORT_NAME_LENGTH = 120;

type NullableStringField =
  | 'first_name'
  | 'middle_name'
  | 'last_name'
  | 'second_surname'
  | 'display_name'
  | 'known_as'
  | 'native_full_name'
  | 'birth_location_id'
  | 'current_city_id'
  | 'primary_nationality_country_id'
  | 'portrait_asset_id';

type NullableEnumField =
  | 'gender'
  | 'hair_color'
  | 'ethnicity'
  | 'skin_color'
  | 'dominant_foot'
  | 'current_profession';

type NullableDateField =
  | 'birth_date'
  | 'death_date'
  | 'professional_division_debut_date'
  | 'retirement_date';

type NullableNumberField = 'height_cm' | 'weight_kg';

type PersonEnumValue =
  | PersonCurrentProfession
  | PersonDominantFoot
  | PersonEthnicity
  | PersonGender
  | PersonHairColor
  | PersonSkinColor;

type PersonEnumField = Readonly<{
  key: NullableEnumField;
  parse: (value: unknown) => PersonEnumValue | null;
  reason: string;
  label: string;
}>;

const PERSON_ENUM_FIELDS: ReadonlyArray<PersonEnumField> = [
  {
    key: 'gender',
    parse: parsePersonGender,
    reason: 'PERSON_INVALID_GENDER',
    label: 'gender',
  },
  {
    key: 'hair_color',
    parse: parsePersonHairColor,
    reason: 'PERSON_INVALID_HAIR_COLOR',
    label: 'hair color',
  },
  {
    key: 'ethnicity',
    parse: parsePersonEthnicity,
    reason: 'PERSON_INVALID_ETHNICITY',
    label: 'ethnicity',
  },
  {
    key: 'skin_color',
    parse: parsePersonSkinColor,
    reason: 'PERSON_INVALID_SKIN_COLOR',
    label: 'skin color',
  },
  {
    key: 'dominant_foot',
    parse: parsePersonDominantFoot,
    reason: 'PERSON_INVALID_DOMINANT_FOOT',
    label: 'dominant foot',
  },
  {
    key: 'current_profession',
    parse: parsePersonCurrentProfession,
    reason: 'PERSON_INVALID_CURRENT_PROFESSION',
    label: 'current profession',
  },
];

const SHORT_NAME_FIELDS: ReadonlyArray<
  Readonly<{ key: 'first_name' | 'middle_name' | 'last_name' | 'second_surname' | 'known_as' | 'native_full_name'; reason: string; label: string }>
> = [
  { key: 'first_name', reason: 'PERSON_FIRST_NAME_TOO_LONG', label: 'first name' },
  { key: 'middle_name', reason: 'PERSON_MIDDLE_NAME_TOO_LONG', label: 'middle name' },
  { key: 'last_name', reason: 'PERSON_LAST_NAME_TOO_LONG', label: 'last name' },
  {
    key: 'second_surname',
    reason: 'PERSON_SECOND_SURNAME_TOO_LONG',
    label: 'second surname',
  },
  { key: 'known_as', reason: 'PERSON_KNOWN_AS_TOO_LONG', label: 'known as' },
  {
    key: 'native_full_name',
    reason: 'PERSON_NATIVE_FULL_NAME_TOO_LONG',
    label: 'native full name',
  },
];

const UUID_FIELDS: ReadonlyArray<
  Readonly<{
    key: 'birth_location_id' | 'current_city_id' | 'primary_nationality_country_id';
    reason: string;
    label: string;
  }>
> = [
  {
    key: 'birth_location_id',
    reason: 'PERSON_INVALID_BIRTH_LOCATION_ID',
    label: 'birth location id',
  },
  {
    key: 'current_city_id',
    reason: 'PERSON_INVALID_CURRENT_CITY_ID',
    label: 'current city id',
  },
  {
    key: 'primary_nationality_country_id',
    reason: 'PERSON_INVALID_PRIMARY_NATIONALITY_COUNTRY_ID',
    label: 'primary nationality country id',
  },
];

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getBoolean(formData: FormData, key: string, fallback = false): boolean {
  const values = formData
    .getAll(key)
    .filter((value): value is string => typeof value === 'string');

  if (values.length === 0) {
    return fallback;
  }

  return values.some(value => {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === 'on' || normalized === '1';
  });
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function parseDate(value: string): string | null {
  if (!value) {
    return null;
  }

  return DATE_PATTERN.test(value) ? value : null;
}

function parseNullableNumber(
  value: string,
): number | null | typeof Number.NaN {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isFutureDate(value: string): boolean {
  return value > new Date().toISOString().slice(0, 10);
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function formError(
  reason: string,
  message: string,
  error = message,
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

function validateMaxLength(
  value: string | null,
  max: number,
  reason: string,
  label: string,
): PersonActionState | null {
  if (!value || value.length <= max) {
    return null;
  }

  return formError(reason, `${label} is too long.`);
}

function validateUuid(
  value: string | null,
  reason: string,
  label: string,
): PersonActionState | null {
  if (!value || isValidUuid(value)) {
    return null;
  }

  return formError(reason, `${label} must be a valid UUID.`);
}

function validateNumber(
  value: number | null,
  reason: string,
  label: string,
): PersonActionState | null {
  if (value === null || value > 0) {
    return null;
  }

  return formError(reason, `${label} must be greater than zero.`);
}

function validateDateValue(
  raw: string,
  label: string,
): PersonActionState | null {
  if (!raw || DATE_PATTERN.test(raw)) {
    return null;
  }

  return formError(
    'INVALID_REQUEST',
    `request is invalid`,
    `${label} must use YYYY-MM-DD format.`,
  );
}

function validateDateRelationships(
  birth_date: string | null,
  death_date: string | null,
  is_deceased: boolean,
  professional_division_debut_date: string | null,
  retirement_date: string | null,
): PersonActionState | null {
  if (birth_date && isFutureDate(birth_date)) {
    return formError(
      'PERSON_BIRTH_DATE_IN_FUTURE',
      'birth date cannot be in the future',
    );
  }

  if (death_date && isFutureDate(death_date)) {
    return formError(
      'PERSON_DEATH_DATE_IN_FUTURE',
      'death date cannot be in the future',
    );
  }

  if (death_date && !is_deceased) {
    return formError(
      'PERSON_DEATH_DATE_REQUIRES_DECEASED',
      'death date requires deceased',
    );
  }

  if (birth_date && death_date && death_date < birth_date) {
    return formError(
      'PERSON_DEATH_DATE_BEFORE_BIRTH_DATE',
      'death date cannot be before birth date',
    );
  }

  if (
    professional_division_debut_date &&
    isFutureDate(professional_division_debut_date)
  ) {
    return formError(
      'PERSON_PROFESSIONAL_DEBUT_DATE_IN_FUTURE',
      'professional debut date cannot be in the future',
    );
  }

  if (retirement_date && isFutureDate(retirement_date)) {
    return formError(
      'PERSON_RETIREMENT_DATE_IN_FUTURE',
      'retirement date cannot be in the future',
    );
  }

  if (
    professional_division_debut_date &&
    retirement_date &&
    retirement_date < professional_division_debut_date
  ) {
    return formError(
      'PERSON_RETIREMENT_DATE_BEFORE_DEBUT_DATE',
      'retirement date cannot be before professional debut date',
    );
  }

  return null;
}

function partialNullable<T>(
  current: T | null,
  original: T | null,
): T | null | typeof UNSET {
  return current === original ? UNSET : current;
}

function partialRequired(
  current: string,
  original: string,
): string | typeof UNSET {
  return current === original ? UNSET : current;
}

function parseEnumField(
  value: string,
  field: PersonEnumField,
): Readonly<{
  value: PersonEnumValue | null;
  error?: PersonActionState;
}> {
  if (!value) {
    return { value: null };
  }

  const parsed = field.parse(value);
  if (parsed !== null) {
    return { value: parsed };
  }

  return {
    value: null,
    error: formError(field.reason, `${field.label} is invalid.`),
  };
}

function runSharedValidations(input: Readonly<{
  full_name: string | null;
  display_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  second_surname: string | null;
  known_as: string | null;
  native_full_name: string | null;
  birth_location_id: string | null;
  current_city_id: string | null;
  primary_nationality_country_id: string | null;
  portrait_asset_id: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  death_date: string | null;
  is_deceased: boolean;
  professional_division_debut_date: string | null;
  retirement_date: string | null;
}>): PersonActionState | null {
  const validations: Array<PersonActionState | null> = [
    input.full_name
      ? validateMaxLength(
          input.full_name,
          MAX_FULL_NAME_LENGTH,
          'PERSON_FULL_NAME_TOO_LONG',
          'full name',
        )
      : null,
    validateMaxLength(
      input.display_name,
      MAX_DISPLAY_NAME_LENGTH,
      'PERSON_DISPLAY_NAME_TOO_LONG',
      'display name',
    ),
    ...SHORT_NAME_FIELDS.map(field =>
      validateMaxLength(
        input[field.key],
        MAX_SHORT_NAME_LENGTH,
        field.reason,
        field.label,
      ),
    ),
    ...UUID_FIELDS.map(field =>
      validateUuid(input[field.key], field.reason, field.label),
    ),
    validateUuid(
      input.portrait_asset_id,
      'PERSON_INVALID_PORTRAIT_ASSET_ID',
      'portrait asset id',
    ),
    validateNumber(
      input.height_cm,
      'PERSON_INVALID_HEIGHT_CM',
      'height_cm',
    ),
    validateNumber(
      input.weight_kg,
      'PERSON_INVALID_WEIGHT_KG',
      'weight_kg',
    ),
    validateDateRelationships(
      input.birth_date,
      input.death_date,
      input.is_deceased,
      input.professional_division_debut_date,
      input.retirement_date,
    ),
  ];

  return validations.find(Boolean) ?? null;
}

export function formatDateForInput(value: string | null | undefined): string {
  if (!value || DATE_PATTERN.test(value)) {
    return value ?? '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

export function buildCreatePersonBody(
  formData: FormData,
): { body?: CreatePersonRequest; error?: PersonActionState } {
  const full_name = getString(formData, 'full_name');

  if (!full_name) {
    return {
      error: formError('PERSON_FULL_NAME_REQUIRED', 'full name is required'),
    };
  }

  const birth_date_raw = getString(formData, 'birth_date');
  const death_date_raw = getString(formData, 'death_date');
  const professional_division_debut_date_raw = getString(
    formData,
    'professional_division_debut_date',
  );
  const retirement_date_raw = getString(formData, 'retirement_date');
  const birth_date = parseDate(birth_date_raw);
  const death_date = parseDate(death_date_raw);
  const professional_division_debut_date = parseDate(
    professional_division_debut_date_raw,
  );
  const retirement_date = parseDate(retirement_date_raw);
  const is_deceased = getBoolean(formData, 'is_deceased', false);
  const height_cm = parseNullableNumber(getString(formData, 'height_cm'));
  const weight_kg = parseNullableNumber(getString(formData, 'weight_kg'));

  const dateErrors = [
    validateDateValue(birth_date_raw, 'birth_date'),
    validateDateValue(death_date_raw, 'death_date'),
    validateDateValue(
      professional_division_debut_date_raw,
      'professional_division_debut_date',
    ),
    validateDateValue(retirement_date_raw, 'retirement_date'),
  ];
  const dateError = dateErrors.find(Boolean);
  if (dateError) {
    return { error: dateError };
  }

  if (Number.isNaN(height_cm)) {
    return {
      error: formError('PERSON_INVALID_HEIGHT_CM', 'height_cm is invalid'),
    };
  }

  if (Number.isNaN(weight_kg)) {
    return {
      error: formError('PERSON_INVALID_WEIGHT_KG', 'weight_kg is invalid'),
    };
  }

  const enumValues = new Map<NullableEnumField, PersonEnumValue | null>();
  for (const field of PERSON_ENUM_FIELDS) {
    const result = parseEnumField(getString(formData, field.key), field);
    if (result.error) {
      return { error: result.error };
    }

    enumValues.set(field.key, result.value);
  }

  const values = {
    full_name,
    display_name: optionalString(getString(formData, 'display_name')),
    first_name: optionalString(getString(formData, 'first_name')),
    middle_name: optionalString(getString(formData, 'middle_name')),
    last_name: optionalString(getString(formData, 'last_name')),
    second_surname: optionalString(getString(formData, 'second_surname')),
    known_as: optionalString(getString(formData, 'known_as')),
    native_full_name: optionalString(getString(formData, 'native_full_name')),
    birth_location_id: optionalString(getString(formData, 'birth_location_id')),
    current_city_id: optionalString(getString(formData, 'current_city_id')),
    primary_nationality_country_id: optionalString(
      getString(formData, 'primary_nationality_country_id'),
    ),
    portrait_asset_id: optionalString(getString(formData, 'portrait_asset_id')),
    height_cm,
    weight_kg,
    birth_date,
    death_date,
    is_deceased,
    professional_division_debut_date,
    retirement_date,
  } as const;

  const validationError = runSharedValidations(values);
  if (validationError) {
    return { error: validationError };
  }

  const body: Record<string, unknown> = {
    full_name,
    is_deceased,
    is_public: getBoolean(formData, 'is_public', true),
  };

  const nullableStringFields: ReadonlyArray<NullableStringField> = [
    'first_name',
    'middle_name',
    'last_name',
    'second_surname',
    'display_name',
    'known_as',
    'native_full_name',
    'birth_location_id',
    'current_city_id',
    'primary_nationality_country_id',
    'portrait_asset_id',
  ];

  for (const key of nullableStringFields) {
    const value = values[key];
    if (value !== null) {
      body[key] = value;
    }
  }

  for (const field of PERSON_ENUM_FIELDS) {
    const value = enumValues.get(field.key) ?? null;
    if (value !== null) {
      body[field.key] = value;
    }
  }

  const nullableDateFields: ReadonlyArray<NullableDateField> = [
    'birth_date',
    'death_date',
    'professional_division_debut_date',
    'retirement_date',
  ];

  for (const key of nullableDateFields) {
    const value = values[key];
    if (value !== null) {
      body[key] = value;
    }
  }

  const nullableNumberFields: ReadonlyArray<NullableNumberField> = [
    'height_cm',
    'weight_kg',
  ];

  for (const key of nullableNumberFields) {
    const value = values[key];
    if (value !== null) {
      body[key] = value;
    }
  }

  return { body: body as CreatePersonRequest };
}

export function buildUpdatePersonBody(formData: FormData): {
  body?: UpdatePersonRequest;
  error?: PersonActionState;
  personId?: string;
} {
  const personId = getString(formData, 'person_id');

  if (!personId) {
    return {
      error: formError('PERSON_ID_REQUIRED', 'person id is required'),
    };
  }

  const full_name = getString(formData, 'full_name');
  const original_full_name = getString(formData, 'original_full_name');
  const fullNameResult = partialRequired(full_name, original_full_name);

  if (fullNameResult !== UNSET && !fullNameResult) {
    return {
      personId,
      error: formError('PERSON_FULL_NAME_REQUIRED', 'full name is required'),
    };
  }

  const currentIsDeceased = getBoolean(formData, 'is_deceased', false);
  const originalIsDeceased = getBoolean(formData, 'original_is_deceased', false);
  const currentIsPublic = getBoolean(formData, 'is_public', false);
  const originalIsPublic = getBoolean(formData, 'original_is_public', false);

  const birth_date_raw = getString(formData, 'birth_date');
  const death_date_raw = getString(formData, 'death_date');
  const professional_division_debut_date_raw = getString(
    formData,
    'professional_division_debut_date',
  );
  const retirement_date_raw = getString(formData, 'retirement_date');

  const birth_date = parseDate(birth_date_raw);
  const death_date = parseDate(death_date_raw);
  const professional_division_debut_date = parseDate(
    professional_division_debut_date_raw,
  );
  const retirement_date = parseDate(retirement_date_raw);

  const dateErrors = [
    validateDateValue(birth_date_raw, 'birth_date'),
    validateDateValue(death_date_raw, 'death_date'),
    validateDateValue(
      professional_division_debut_date_raw,
      'professional_division_debut_date',
    ),
    validateDateValue(retirement_date_raw, 'retirement_date'),
  ];
  const dateError = dateErrors.find(Boolean);
  if (dateError) {
    return { personId, error: dateError };
  }

  const height_cm = parseNullableNumber(getString(formData, 'height_cm'));
  const weight_kg = parseNullableNumber(getString(formData, 'weight_kg'));
  const original_height_cm = parseNullableNumber(
    getString(formData, 'original_height_cm'),
  );
  const original_weight_kg = parseNullableNumber(
    getString(formData, 'original_weight_kg'),
  );

  if (Number.isNaN(height_cm)) {
    return {
      personId,
      error: formError('PERSON_INVALID_HEIGHT_CM', 'height_cm is invalid'),
    };
  }

  if (Number.isNaN(weight_kg)) {
    return {
      personId,
      error: formError('PERSON_INVALID_WEIGHT_KG', 'weight_kg is invalid'),
    };
  }

  const original_birth_date =
    parseDate(getString(formData, 'original_birth_date')) ??
    optionalString(getString(formData, 'original_birth_date'));
  const original_death_date =
    parseDate(getString(formData, 'original_death_date')) ??
    optionalString(getString(formData, 'original_death_date'));
  const original_professional_division_debut_date =
    parseDate(getString(formData, 'original_professional_division_debut_date')) ??
    optionalString(getString(formData, 'original_professional_division_debut_date'));
  const original_retirement_date =
    parseDate(getString(formData, 'original_retirement_date')) ??
    optionalString(getString(formData, 'original_retirement_date'));

  const effective_birth_date = birth_date ?? original_birth_date;
  const effective_death_date = currentIsDeceased
    ? death_date ?? original_death_date
    : null;
  const effective_professional_division_debut_date =
    professional_division_debut_date ??
    original_professional_division_debut_date;
  const effective_retirement_date = retirement_date ?? original_retirement_date;

  const enumValues = new Map<
    NullableEnumField,
    Readonly<{ current: PersonEnumValue | null; original: PersonEnumValue | null }>
  >();

  for (const field of PERSON_ENUM_FIELDS) {
    const currentRawValue = getString(formData, field.key);
    const originalRawValue = getString(formData, `original_${field.key}`);

    if (
      field.key === 'gender' &&
      currentRawValue.length === 0 &&
      currentRawValue !== originalRawValue
    ) {
      return {
        personId,
        error: formError(field.reason, `${field.label} is invalid.`),
      };
    }

    const currentResult = parseEnumField(currentRawValue, field);
    if (currentResult.error) {
      return { personId, error: currentResult.error };
    }

    const originalResult = parseEnumField(originalRawValue, field);
    if (originalResult.error) {
      return { personId, error: originalResult.error };
    }

    enumValues.set(field.key, {
      current: currentResult.value,
      original: originalResult.value,
    });
  }

  const values = {
    full_name: fullNameResult === UNSET ? original_full_name : fullNameResult,
    display_name: optionalString(getString(formData, 'display_name')),
    first_name: optionalString(getString(formData, 'first_name')),
    middle_name: optionalString(getString(formData, 'middle_name')),
    last_name: optionalString(getString(formData, 'last_name')),
    second_surname: optionalString(getString(formData, 'second_surname')),
    known_as: optionalString(getString(formData, 'known_as')),
    native_full_name: optionalString(getString(formData, 'native_full_name')),
    birth_location_id: optionalString(getString(formData, 'birth_location_id')),
    current_city_id: optionalString(getString(formData, 'current_city_id')),
    primary_nationality_country_id: optionalString(
      getString(formData, 'primary_nationality_country_id'),
    ),
    portrait_asset_id: optionalString(getString(formData, 'portrait_asset_id')),
    height_cm,
    weight_kg,
    birth_date: effective_birth_date,
    death_date: effective_death_date,
    is_deceased: currentIsDeceased,
    professional_division_debut_date:
      effective_professional_division_debut_date,
    retirement_date: effective_retirement_date,
  } as const;

  const validationError = runSharedValidations(values);
  if (validationError) {
    return { personId, error: validationError };
  }

  const body: Record<string, unknown> = {};

  if (fullNameResult !== UNSET) {
    body.full_name = fullNameResult;
  }

  const nullableStringFields: ReadonlyArray<NullableStringField> = [
    'first_name',
    'middle_name',
    'last_name',
    'second_surname',
    'display_name',
    'known_as',
    'native_full_name',
    'birth_location_id',
    'current_city_id',
    'primary_nationality_country_id',
    'portrait_asset_id',
  ];

  for (const key of nullableStringFields) {
    const result = partialNullable(
      optionalString(getString(formData, key)),
      optionalString(getString(formData, `original_${key}`)),
    );
    if (result !== UNSET) {
      body[key] = result;
    }
  }

  for (const field of PERSON_ENUM_FIELDS) {
    const value = enumValues.get(field.key);
    if (!value) {
      continue;
    }

    const result = partialNullable(value.current, value.original);
    if (result !== UNSET) {
      body[field.key] = result;
    }
  }

  const birthDateResult = partialNullable(birth_date, original_birth_date);
  if (birthDateResult !== UNSET) {
    body.birth_date = birthDateResult;
  }

  if (!currentIsDeceased) {
    if (original_death_date !== null || death_date_raw.length > 0) {
      body.death_date = null;
    }
  } else {
    const deathDateResult = partialNullable(death_date, original_death_date);
    if (deathDateResult !== UNSET) {
      body.death_date = deathDateResult;
    }
  }

  const debutDateResult = partialNullable(
    professional_division_debut_date,
    original_professional_division_debut_date,
  );
  if (debutDateResult !== UNSET) {
    body.professional_division_debut_date = debutDateResult;
  }

  const retirementDateResult = partialNullable(
    retirement_date,
    original_retirement_date,
  );
  if (retirementDateResult !== UNSET) {
    body.retirement_date = retirementDateResult;
  }

  const heightResult = partialNullable(height_cm, original_height_cm);
  if (heightResult !== UNSET) {
    body.height_cm = heightResult;
  }

  const weightResult = partialNullable(weight_kg, original_weight_kg);
  if (weightResult !== UNSET) {
    body.weight_kg = weightResult;
  }

  if (currentIsDeceased !== originalIsDeceased) {
    body.is_deceased = currentIsDeceased;
  }

  if (currentIsPublic !== originalIsPublic) {
    body.is_public = currentIsPublic;
  }

  return { personId, body: body as UpdatePersonRequest };
}
