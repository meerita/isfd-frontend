/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export type FederationErrorMessageMap = Readonly<Record<string, string>>;

export const FEDERATION_ERROR_MESSAGES: FederationErrorMessageMap = {
  FEDERATION_NOT_FOUND: 'This federation could not be found.',
  FEDERATION_NAME_REQUIRED: 'Federation name is required.',
  FEDERATION_NAME_TOO_LONG: 'Federation name is too long.',
  FEDERATION_NAME_ALREADY_EXISTS: 'A federation with this name already exists.',
  FEDERATION_NATIVE_NAME_TOO_LONG: 'Native name is too long.',
  FEDERATION_SHORT_NAME_TOO_LONG: 'Short name is too long.',
  FEDERATION_ACRONYM_TOO_LONG: 'Acronym is too long.',
  FEDERATION_INVALID_LEVEL: 'Select a valid federation level.',
  FEDERATION_INVALID_COUNTRY_ID: 'Select a valid country.',
  FEDERATION_INVALID_CITY_ID: 'Select a valid city.',
  FEDERATION_CITY_REQUIRES_COUNTRY: 'Select a country before selecting a city.',
  FEDERATION_FOUNDATION_DATE_IN_FUTURE:
    'Foundation date cannot be in the future.',
  FEDERATION_DISSOLUTION_DATE_IN_FUTURE:
    'Dissolution date cannot be in the future.',
  FEDERATION_DISSOLUTION_DATE_BEFORE_FOUNDATION_DATE:
    'Dissolution date cannot be before foundation date.',
  FEDERATION_INVALID_OFFICIAL_WEBSITE: 'Enter a valid official website URL.',
  FEDERATION_INVALID_ICON_URL: 'Enter a valid icon URL.',
  FEDERATION_INVALID_HERO_IMAGE_URL: 'Enter a valid hero image URL.',
  FEDERATION_HAS_RELATIONS:
    'This federation cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the federation form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid federation response.',
};

export function resolveFederationErrorMessage(error?: ApiErrorResponse): string {
  return resolveLocalizedFederationErrorMessage(error);
}

export function resolveLocalizedFederationErrorMessage(
  error?: ApiErrorResponse,
  messages: FederationErrorMessageMap = FEDERATION_ERROR_MESSAGES,
  fallback = 'Unexpected error.',
): string {
  if (!error) return fallback;

  return messages[error.reason] ?? error.error ?? error.message ?? fallback;
}
