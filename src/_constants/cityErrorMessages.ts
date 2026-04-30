/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export const CITY_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_REQUEST: 'The city request was invalid.',
  INTERNAL_SERVER_ERROR: 'The city request failed on the server.',
  CITY_NOT_FOUND: 'This city could not be found.',
  CITY_ID_REQUIRED: 'City identifier is required.',
  CITY_NAME_REQUIRED: 'City name is required.',
  CITY_COUNTRY_ID_REQUIRED: 'Select a country.',
  CITY_COUNTRY_ID_INVALID: 'Select a valid country.',
  CITY_INVALID_LATITUDE: 'Latitude must be between -90 and 90.',
  CITY_INVALID_LONGITUDE: 'Longitude must be between -180 and 180.',
  FORM_VALIDATION_ERROR: 'Review the city form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid city response.',
};

export function resolveCityErrorMessage(error?: ApiErrorResponse): string {
  if (!error) return 'Unexpected error.';

  return (
    CITY_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}
