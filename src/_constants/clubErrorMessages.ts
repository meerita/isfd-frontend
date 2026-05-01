/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export type ClubErrorMessageMap = Readonly<Record<string, string>>;

export const CLUB_ERROR_MESSAGES: ClubErrorMessageMap = {
  INVALID_REQUEST: 'The club request was invalid.',
  INTERNAL_SERVER_ERROR: 'The club request failed on the server.',
  CLUB_NOT_FOUND: 'This club could not be found.',
  CLUB_ID_REQUIRED: 'Club identifier is required.',
  CLUB_SLUG_REQUIRED: 'Club slug is required.',
  CLUB_NAME_REQUIRED: 'Club name is required.',
  CLUB_NAME_TOO_LONG: 'Club name is too long.',
  CLUB_SHORT_NAME_TOO_LONG: 'Short name is too long.',
  CLUB_ACRONYM_TOO_LONG: 'Acronym is too long.',
  CLUB_NATIVE_NAME_TOO_LONG: 'Native name is too long.',
  CLUB_FOUNDED_AS_TOO_LONG: 'Founded as is too long.',
  CLUB_INVALID_COUNTRY_ID: 'Select a valid country.',
  CLUB_INVALID_CITY_ID: 'Select a valid city.',
  CLUB_INVALID_PRIMARY_STADIUM_ID: 'Select a valid primary stadium.',
  CLUB_CITY_REQUIRES_COUNTRY: 'Select a country before selecting a city.',
  CLUB_FOUNDED_AT_IN_FUTURE: 'Founded at cannot be in the future.',
  CLUB_DISSOLVED_AT_IN_FUTURE: 'Dissolved at cannot be in the future.',
  CLUB_DISSOLVED_AT_BEFORE_FOUNDED_AT:
    'Dissolved at cannot be before founded at.',
  CLUB_DISSOLVED_AT_REQUIRES_DISSOLVED:
    'Set the club as dissolved before adding a dissolved date.',
  CLUB_INVALID_OFFICIAL_WEBSITE_URL: 'Enter a valid official website URL.',
  CLUB_INVALID_LOGO_URL: 'Enter a valid logo URL.',
  CLUB_INVALID_HERO_IMAGE_URL: 'Enter a valid hero image URL.',
  CLUB_SLUG_GENERATION_FAILED: 'The backend could not generate a club slug.',
  CLUB_HAS_REFERENCES:
    'This club cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the club form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid club response.',
};

export function resolveClubErrorMessage(error?: ApiErrorResponse): string {
  return resolveLocalizedClubErrorMessage(error);
}

export function resolveLocalizedClubErrorMessage(
  error?: ApiErrorResponse,
  messages: ClubErrorMessageMap = CLUB_ERROR_MESSAGES,
  fallback = 'Unexpected error.',
): string {
  if (!error) return fallback;

  return messages[error.reason] ?? error.error ?? error.message ?? fallback;
}
