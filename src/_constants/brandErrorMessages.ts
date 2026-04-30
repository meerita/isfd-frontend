/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export const BRAND_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_REQUEST: 'The brand request was invalid.',
  INTERNAL_SERVER_ERROR: 'The brand request failed on the server.',
  BRAND_NOT_FOUND: 'This brand could not be found.',
  BRAND_NAME_REQUIRED: 'Brand name is required.',
  BRAND_NAME_TOO_LONG: 'Brand name is too long.',
  BRAND_NAME_ALREADY_EXISTS: 'A brand with this name already exists.',
  BRAND_INVALID_WEBSITE_URL: 'Enter a valid website URL.',
  BRAND_INVALID_ICON_IMAGE_URL: 'Enter a valid icon image URL.',
  BRAND_INVALID_DETAIL_IMAGE_URL: 'Enter a valid detail image URL.',
  BRAND_SLUG_GENERATION_FAILED: 'The backend could not generate a brand slug.',
  BRAND_HAS_REFERENCES:
    'This brand cannot be deleted because it is linked to other records.',
  FORM_VALIDATION_ERROR: 'Review the brand form values and try again.',
  INVALID_RESPONSE: 'The backend returned an invalid brand response.',
};

export function resolveBrandErrorMessage(error?: ApiErrorResponse): string {
  if (!error) return 'Unexpected error.';

  return (
    BRAND_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}
