/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export const STADIUM_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_REQUEST: 'The stadium request was invalid.',
  INTERNAL_SERVER_ERROR: 'The stadium request failed on the server.',
  STADIUM_NOT_FOUND: 'This stadium could not be found.',
  STADIUM_ID_REQUIRED: 'Stadium identifier is required.',
  STADIUM_NAME_REQUIRED: 'Stadium name is required.',
  STADIUM_NAME_TOO_LONG: 'Stadium name is too long.',
  STADIUM_FORMER_NAMES_TOO_LONG: 'Former names are too long.',
  STADIUM_INVALID_COUNTRY_ID: 'Select a valid country.',
  STADIUM_INVALID_CITY_ID: 'Select a valid city.',
  STADIUM_INVALID_PRIMARY_CLUB_ID: 'Enter a valid primary club UUID.',
  STADIUM_CITY_REQUIRES_COUNTRY: 'Select a country before selecting a city.',
  STADIUM_INVALID_IMAGE_URL: 'Enter a valid image URL.',
  STADIUM_INVALID_SEAT_COUNT: 'Enter a valid seat count.',
  STADIUM_INVALID_SURFACE_TYPE: 'Select a valid surface type.',
  STADIUM_SURFACE_TYPE_TOO_LONG: 'Surface type is too long.',
  STADIUM_SLUG_GENERATION_FAILED:
    'The backend could not generate a stadium slug.',
  STADIUM_HAS_REFERENCES:
    'This stadium cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the stadium form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid stadium response.',
};

export function resolveStadiumErrorMessage(error?: ApiErrorResponse): string {
  if (!error) return 'Unexpected error.';

  return (
    STADIUM_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}
