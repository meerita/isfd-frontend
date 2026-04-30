/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export const PERSON_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_REQUEST: 'The person request was invalid.',
  INTERNAL_SERVER_ERROR: 'The person request failed on the server.',
  PERSON_NOT_FOUND: 'This person could not be found.',
  PERSON_ID_REQUIRED: 'Person identifier is required.',
  PERSON_SLUG_REQUIRED: 'Person slug is required.',
  PERSON_FULL_NAME_REQUIRED: 'Full name is required.',
  PERSON_FULL_NAME_TOO_LONG: 'Full name is too long.',
  PERSON_DISPLAY_NAME_TOO_LONG: 'Display name is too long.',
  PERSON_FIRST_NAME_TOO_LONG: 'First name is too long.',
  PERSON_MIDDLE_NAME_TOO_LONG: 'Middle name is too long.',
  PERSON_LAST_NAME_TOO_LONG: 'Last name is too long.',
  PERSON_SECOND_SURNAME_TOO_LONG: 'Second surname is too long.',
  PERSON_KNOWN_AS_TOO_LONG: 'Known as is too long.',
  PERSON_NATIVE_FULL_NAME_TOO_LONG: 'Native full name is too long.',
  PERSON_INVALID_GENDER: 'Enter a valid gender.',
  PERSON_INVALID_BIRTH_LOCATION_ID: 'Enter a valid birth location identifier.',
  PERSON_INVALID_PRIMARY_NATIONALITY_COUNTRY_ID:
    'Select a valid primary nationality country.',
  PERSON_INVALID_HAIR_COLOR: 'Enter a valid hair color.',
  PERSON_INVALID_ETHNICITY: 'Enter a valid ethnicity.',
  PERSON_INVALID_SKIN_COLOR: 'Enter a valid skin color.',
  PERSON_INVALID_DOMINANT_FOOT: 'Enter a valid dominant foot.',
  PERSON_INVALID_CURRENT_PROFESSION: 'Enter a valid current profession.',
  PERSON_BIRTH_DATE_IN_FUTURE: 'Birth date cannot be in the future.',
  PERSON_DEATH_DATE_IN_FUTURE: 'Death date cannot be in the future.',
  PERSON_DEATH_DATE_BEFORE_BIRTH_DATE:
    'Death date cannot be before birth date.',
  PERSON_DEATH_DATE_REQUIRES_DECEASED:
    'Set the person as deceased before adding a death date.',
  PERSON_PROFESSIONAL_DEBUT_DATE_IN_FUTURE:
    'Professional debut date cannot be in the future.',
  PERSON_RETIREMENT_DATE_IN_FUTURE: 'Retirement date cannot be in the future.',
  PERSON_RETIREMENT_DATE_BEFORE_DEBUT_DATE:
    'Retirement date cannot be before professional debut date.',
  PERSON_INVALID_HEIGHT_CM: 'Enter a valid height in centimeters.',
  PERSON_INVALID_WEIGHT_KG: 'Enter a valid weight in kilograms.',
  PERSON_INVALID_AVATAR_IMAGE_URL: 'Enter a valid avatar image URL.',
  PERSON_INVALID_HERO_IMAGE_URL: 'Enter a valid hero image URL.',
  PERSON_SLUG_GENERATION_FAILED:
    'The backend could not generate a person slug.',
  PERSON_HAS_REFERENCES:
    'This person cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the person form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid person response.',
};

export function resolvePersonErrorMessage(error?: ApiErrorResponse): string {
  if (!error) return 'Unexpected error.';

  return (
    PERSON_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}
