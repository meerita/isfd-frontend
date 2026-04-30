/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export const COUNTRY_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_REQUEST: 'The country request was invalid.',
  INTERNAL_SERVER_ERROR: 'The country request failed on the server.',
  COUNTRY_NOT_FOUND: 'This country could not be found.',
  COUNTRY_ID_REQUIRED: 'Country identifier is required.',
  COUNTRY_NAME_REQUIRED: 'Country name is required.',
  COUNTRY_SLUG_REQUIRED: 'Country slug is required.',
  COUNTRY_TRANSLATION_KEY_REQUIRED: 'Country translation key is required.',
  COUNTRY_SLUG_TAKEN: 'Country is already created.',
  COUNTRY_TRANSLATION_KEY_TAKEN: 'Country translation key is already in use.',
  COUNTRY_ISO2_CODE_TAKEN: 'ISO 2 code is already in use by another country.',
  COUNTRY_ISO3_CODE_TAKEN: 'ISO 3 code is already in use by another country.',
  COUNTRY_INVALID_ISO2_CODE:
    'ISO 2 code must contain exactly 2 uppercase letters.',
  COUNTRY_INVALID_ISO3_CODE:
    'ISO 3 code must contain exactly 3 uppercase letters.',
  COUNTRY_INVALID_CONTINENT_CODE: 'Select a valid continent.',
  COUNTRY_INVALID_FLAG_IMAGE_URL: 'Enter a valid flag image URL.',
  FORM_VALIDATION_ERROR: 'Review the country form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid country response.',
};

export function resolveCountryErrorMessage(error?: ApiErrorResponse): string {
  if (!error) return 'Unexpected error.';

  return (
    COUNTRY_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}
