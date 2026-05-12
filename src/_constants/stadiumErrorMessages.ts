/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export type StadiumErrorMessageMap = Readonly<Record<string, string>>;

const PREFER_BACKEND_DETAIL_REASONS = new Set([
  'INVALID_REQUEST',
  'INTERNAL_SERVER_ERROR',
]);

export const STADIUM_ERROR_MESSAGES: StadiumErrorMessageMap = {
  INVALID_REQUEST: 'The stadium request was invalid.',
  INVALID_PAGINATION: 'The stadium pagination values were invalid.',
  INVALID_SORT: 'The stadium sort value was invalid.',
  INVALID_STATUS: 'The stadium status filter was invalid.',
  UNAUTHORIZED: 'You must sign in to continue.',
  INTERNAL_SERVER_ERROR: 'The stadium request failed on the server.',
  STADIUM_NOT_FOUND: 'This stadium could not be found.',
  STADIUM_ID_REQUIRED: 'Stadium identifier is required.',
  STADIUM_NAME_REQUIRED: 'Stadium name is required.',
  STADIUM_NAME_TOO_LONG: 'Stadium name is too long.',
  STADIUM_FORMER_NAME_TOO_LONG: 'A former name is too long.',
  STADIUM_FORMER_NAMES_INVALID: 'Review the former names list.',
  STADIUM_INVALID_COUNTRY_ID: 'Select a valid country.',
  STADIUM_INVALID_CITY_ID: 'Select a valid city.',
  STADIUM_INVALID_PRIMARY_CLUB_ID: 'Enter a valid primary club UUID.',
  STADIUM_CITY_REQUIRES_COUNTRY: 'Select a country before selecting a city.',
  STADIUM_CITY_COUNTRY_MISMATCH: 'The selected city does not belong to the country.',
  STADIUM_PRIMARY_CLUB_INACTIVE: 'The selected primary club is not active.',
  STADIUM_INVALID_OFFICIAL_WEBSITE_URL:
    'Enter a valid official website URL.',
  STADIUM_INVALID_SEAT_COUNT: 'Enter a valid seat count.',
  STADIUM_INVALID_SURFACE_TYPE: 'Select a valid surface type.',
  STADIUM_INVALID_OPENED_ON: 'Enter a valid opened on date.',
  STADIUM_INVALID_CLOSED_ON: 'Enter a valid closed on date.',
  STADIUM_OPENED_ON_IN_FUTURE: 'Opened on date cannot be in the future.',
  STADIUM_CLOSED_ON_IN_FUTURE: 'Closed on date cannot be in the future.',
  STADIUM_CLOSED_ON_BEFORE_OPENED_ON:
    'Closed on date cannot be before opened on date.',
  STADIUM_INVALID_PITCH_LENGTH: 'Enter a valid pitch length.',
  STADIUM_INVALID_PITCH_WIDTH: 'Enter a valid pitch width.',
  STADIUM_SLUG_GENERATION_FAILED:
    'The backend could not generate a stadium slug.',
  STADIUM_IMAGES_REQUIRED: 'Select at least one image to upload.',
  STADIUM_IMAGE_ATTACHMENT_NOT_FOUND: 'This stadium image could not be found.',
  STADIUM_HAS_REFERENCES:
    'This stadium cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the stadium form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid stadium response.',
};

export function resolveStadiumErrorMessage(error?: ApiErrorResponse): string {
  return resolveLocalizedStadiumErrorMessage(error);
}

export function resolveLocalizedStadiumErrorMessage(
  error?: ApiErrorResponse,
  messages: StadiumErrorMessageMap = STADIUM_ERROR_MESSAGES,
  fallback = 'Unexpected error.',
): string {
  if (!error) return fallback;

  if (PREFER_BACKEND_DETAIL_REASONS.has(error.reason)) {
    return error.error ?? error.message ?? messages[error.reason] ?? fallback;
  }

  return messages[error.reason] ?? error.error ?? error.message ?? fallback;
}
