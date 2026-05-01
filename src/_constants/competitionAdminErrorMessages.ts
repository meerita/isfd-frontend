/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export type CompetitionAdminErrorMessageMap = Readonly<Record<string, string>>;

export const COMPETITION_ADMIN_ERROR_MESSAGES: CompetitionAdminErrorMessageMap = {
  INVALID_REQUEST: 'The request was invalid.',
  INTERNAL_SERVER_ERROR: 'The request failed on the server.',
  INVALID_RESPONSE: 'The backend returned an invalid response.',
  FORM_VALIDATION_ERROR: 'Review the form values and try again.',
  COMPETITION_TYPE_NOT_FOUND: 'This competition type could not be found.',
  COMPETITION_NOT_FOUND: 'This competition could not be found.',
  SEASON_NOT_FOUND: 'This season could not be found.',
  COMPETITION_EDITION_NOT_FOUND: 'This competition edition could not be found.',
  COMPETITION_TYPE_ID_REQUIRED: 'Competition type identifier is required.',
  COMPETITION_ID_REQUIRED: 'Competition identifier is required.',
  SEASON_ID_REQUIRED: 'Season identifier is required.',
  COMPETITION_EDITION_ID_REQUIRED: 'Competition edition identifier is required.',
  COMPETITION_TYPE_NAME_REQUIRED: 'Competition type name is required.',
  COMPETITION_TYPE_CODE_REQUIRED: 'Competition type code is required.',
  COMPETITION_TYPE_CATEGORY_REQUIRED:
    'Competition type category is required.',
  COMPETITION_TYPE_PARTICIPANT_SCOPE_REQUIRED:
    'Participant scope is required.',
  COMPETITION_NAME_REQUIRED: 'Competition name is required.',
  COMPETITION_CODE_REQUIRED: 'Competition code is required.',
  COMPETITION_COMPETITION_TYPE_ID_REQUIRED:
    'Competition type is required.',
  COMPETITION_INVALID_COMPETITION_TYPE_ID: 'Select a valid competition type.',
  COMPETITION_INVALID_FEDERATION_ID: 'Select a valid federation.',
  COMPETITION_INVALID_COUNTRY_ID: 'Select a valid country.',
  COMPETITION_INVALID_DATE_RANGE:
    'End date cannot be before the start date.',
  SEASON_NAME_REQUIRED: 'Season name is required.',
  SEASON_CODE_REQUIRED: 'Season code is required.',
  SEASON_START_YEAR_REQUIRED: 'Start year is required.',
  SEASON_INVALID_START_YEAR: 'Enter a valid start year.',
  SEASON_INVALID_END_YEAR: 'Enter a valid end year.',
  SEASON_INVALID_YEAR_RANGE: 'End year cannot be before start year.',
  COMPETITION_EDITION_NAME_REQUIRED: 'Competition edition name is required.',
  COMPETITION_EDITION_INVALID_COMPETITION_ID:
    'Select a valid competition.',
  COMPETITION_EDITION_INVALID_SEASON_ID: 'Select a valid season.',
  COMPETITION_EDITION_CODE_REQUIRED: 'Competition edition code is required.',
};

export function resolveCompetitionAdminErrorMessage(
  error?: ApiErrorResponse,
  fallback = 'Unexpected error.',
): string {
  return resolveLocalizedCompetitionAdminErrorMessage(
    error,
    COMPETITION_ADMIN_ERROR_MESSAGES,
    fallback,
  );
}

export function resolveLocalizedCompetitionAdminErrorMessage(
  error?: ApiErrorResponse,
  messages: CompetitionAdminErrorMessageMap = COMPETITION_ADMIN_ERROR_MESSAGES,
  fallback = 'Unexpected error.',
): string {
  if (!error) return fallback;

  return messages[error.reason] ?? error.error ?? error.message ?? fallback;
}
