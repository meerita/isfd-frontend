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
  COMPETITION_PYRAMID_NOT_FOUND: 'This competition pyramid could not be found.',
  COMPETITION_TIER_NOT_FOUND: 'This competition tier could not be found.',
  SEASON_NOT_FOUND: 'This season could not be found.',
  COMPETITION_EDITION_NOT_FOUND: 'This competition edition could not be found.',
  COMPETITION_TYPE_ID_REQUIRED: 'Competition type identifier is required.',
  COMPETITION_ID_REQUIRED: 'Competition identifier is required.',
  COMPETITION_PYRAMID_ID_REQUIRED: 'Competition pyramid identifier is required.',
  COMPETITION_TIER_ID_REQUIRED: 'Competition tier identifier is required.',
  SEASON_ID_REQUIRED: 'Season identifier is required.',
  COMPETITION_EDITION_ID_REQUIRED: 'Competition edition identifier is required.',
  COMPETITION_TYPE_NAME_REQUIRED: 'Competition type name is required.',
  COMPETITION_TYPE_CODE_REQUIRED: 'Competition type code is required.',
  COMPETITION_TYPE_CATEGORY_REQUIRED:
    'Competition type category is required.',
  COMPETITION_TYPE_INVALID_CATEGORY: 'Select a valid competition type category.',
  COMPETITION_TYPE_PARTICIPANT_SCOPE_REQUIRED:
    'Participant scope is required.',
  COMPETITION_TYPE_INVALID_PARTICIPANT_SCOPE:
    'Select a valid participant scope.',
  COMPETITION_TYPE_CODE_ALREADY_EXISTS:
    'This competition type code is already in use.',
  COMPETITION_TYPE_SLUG_ALREADY_EXISTS:
    'This competition type slug is already in use.',
  COMPETITION_TYPE_SLUG_GENERATION_FAILED:
    'The competition type slug could not be generated.',
  COMPETITION_NAME_REQUIRED: 'Competition name is required.',
  COMPETITION_CODE_REQUIRED: 'Competition code is required.',
  COMPETITION_COMPETITION_TYPE_ID_REQUIRED:
    'Competition type is required.',
  COMPETITION_INVALID_COMPETITION_TYPE_ID: 'Select a valid competition type.',
  COMPETITION_INVALID_FEDERATION_ID: 'Select a valid federation.',
  COMPETITION_INVALID_COUNTRY_ID: 'Select a valid country.',
  COMPETITION_INVALID_COMPETITION_PYRAMID_ID:
    'Select a valid competition pyramid.',
  PRIMARY_COMPETITION_TIER_ID_REQUIRED:
    'Primary competition tier is required.',
  COMPETITION_INVALID_PRIMARY_COMPETITION_TIER_ID:
    'Select a valid primary competition tier.',
  COMPETITION_INVALID_ALLOWED_COMPETITION_TIER_ID:
    'One allowed competition tier is invalid.',
  COMPETITION_DUPLICATE_ALLOWED_COMPETITION_TIER_IDS:
    'Allowed competition tiers cannot contain duplicates.',
  COMPETITION_PRIMARY_TIER_REQUIRES_PYRAMID:
    'Primary competition tier requires a competition pyramid.',
  COMPETITION_ALLOWED_TIERS_REQUIRE_PYRAMID:
    'Allowed competition tiers require a competition pyramid.',
  COMPETITION_PRIMARY_TIER_MUST_BE_ALLOWED:
    'Primary competition tier must be included in the allowed tiers.',
  COMPETITION_TIER_BELONGS_TO_ANOTHER_PYRAMID:
    'The selected tier belongs to another competition pyramid.',
  COMPETITION_ENDED_ON_BEFORE_STARTED_ON:
    'End date cannot be before the start date.',
  COMPETITION_CODE_ALREADY_EXISTS: 'This competition code is already in use.',
  COMPETITION_SLUG_ALREADY_EXISTS: 'This competition slug is already in use.',
  COMPETITION_SLUG_GENERATION_FAILED:
    'The competition slug could not be generated.',
  COMPETITION_HAS_RELATIONS:
    'This competition cannot be deleted because it has related records.',
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
  COMPETITION_EDITION_CODE_TOO_LONG:
    'Competition edition code is too long.',
  COMPETITION_EDITION_CODE_MUST_BE_UPPERCASE:
    'Competition edition code must be uppercase.',
  COMPETITION_EDITION_CODE_INVALID_FORMAT:
    'Competition edition code format is invalid.',
  COMPETITION_EDITION_CODE_ALREADY_EXISTS:
    'This competition edition code is already in use.',
  COMPETITION_EDITION_SLUG_ALREADY_EXISTS:
    'This competition edition slug is already in use.',
  COMPETITION_EDITION_SLUG_GENERATION_FAILED:
    'The competition edition slug could not be generated.',
  COMPETITION_EDITION_LABEL_TOO_LONG:
    'Competition edition label is too long.',
  COMPETITION_EDITION_SHORT_NAME_TOO_LONG:
    'Competition edition short name is too long.',
  COMPETITION_EDITION_INVALID_YEAR: 'Enter a valid competition edition year.',
  COMPETITION_EDITION_INVALID_STATUS:
    'Select a valid competition edition status.',
  COMPETITION_EDITION_INVALID_SORT_ORDER:
    'Enter a valid competition edition sort order.',
  COMPETITION_EDITION_ACTIVE_VALUE_REQUIRED:
    'Competition edition active value is required.',
  COMPETITION_EDITION_COMPETITION_NOT_FOUND:
    'The selected competition could not be found.',
  COMPETITION_EDITION_SEASON_NOT_FOUND:
    'The selected season could not be found.',
  COMPETITION_EDITION_INVALID_STARTED_ON:
    'Enter a valid competition edition start date.',
  COMPETITION_EDITION_INVALID_ENDED_ON:
    'Enter a valid competition edition end date.',
  COMPETITION_EDITION_ENDED_ON_BEFORE_STARTED_ON:
    'Competition edition end date cannot be before the start date.',
  COMPETITION_PYRAMID_COUNTRY_ID_REQUIRED:
    'Competition pyramid country is required.',
  COMPETITION_PYRAMID_CODE_REQUIRED: 'Competition pyramid code is required.',
  COMPETITION_PYRAMID_NAME_REQUIRED: 'Competition pyramid name is required.',
  COMPETITION_PYRAMID_SCOPE_KIND_REQUIRED:
    'Competition pyramid scope is required.',
  INVALID_COMPETITION_PYRAMID_SCOPE_KIND:
    'Select a valid competition pyramid scope.',
  COMPETITION_PYRAMID_ACTIVE_VALUE_REQUIRED:
    'Competition pyramid active value is required.',
  COMPETITION_PYRAMID_SLUG_GENERATION_FAILED:
    'The competition pyramid slug could not be generated.',
  COMPETITION_PYRAMID_CODE_ALREADY_EXISTS:
    'This competition pyramid code is already in use.',
  COMPETITION_PYRAMID_SLUG_ALREADY_EXISTS:
    'This competition pyramid slug is already in use.',
  INVALID_COMPETITION_PYRAMID_COUNTRY_ID:
    'Select a valid competition pyramid country.',
  INVALID_COMPETITION_PYRAMID_FEDERATION_ID:
    'Select a valid competition pyramid federation.',
  INVALID_COMPETITION_PYRAMID_SORT:
    'Enter a valid competition pyramid sort value.',
  INVALID_COMPETITION_PYRAMID_STATUS:
    'Select a valid competition pyramid status.',
  COMPETITION_TIER_COMPETITION_PYRAMID_ID_REQUIRED:
    'Competition tier pyramid is required.',
  INVALID_COMPETITION_TIER_PARENT_TIER_ID:
    'Select a valid parent competition tier.',
  COMPETITION_TIER_CODE_REQUIRED: 'Competition tier code is required.',
  COMPETITION_TIER_CODE_ALREADY_EXISTS:
    'This competition tier code is already in use.',
  COMPETITION_TIER_SLUG_ALREADY_EXISTS:
    'This competition tier slug is already in use.',
  COMPETITION_TIER_NAME_REQUIRED: 'Competition tier name is required.',
  COMPETITION_TIER_SCOPE_KIND_REQUIRED:
    'Competition tier scope is required.',
  INVALID_COMPETITION_TIER_SCOPE_KIND:
    'Select a valid competition tier scope.',
  COMPETITION_TIER_PARTICIPANT_SCOPE_REQUIRED:
    'Competition tier participant scope is required.',
  INVALID_COMPETITION_TIER_PARTICIPANT_SCOPE:
    'Select a valid competition tier participant scope.',
  INVALID_COMPETITION_TIER_LEVEL_ORDER:
    'Enter a valid competition tier level order.',
  COMPETITION_TIER_ACTIVE_VALUE_REQUIRED:
    'Competition tier active value is required.',
  COMPETITION_TIER_SLUG_GENERATION_FAILED:
    'The competition tier slug could not be generated.',
  INVALID_COMPETITION_TIER_COMPETITION_PYRAMID_ID:
    'Select a valid competition pyramid for this tier.',
  COMPETITION_TIER_PARENT_BELONGS_TO_ANOTHER_PYRAMID:
    'The selected parent tier belongs to another pyramid.',
  COMPETITION_TIER_SELF_PARENT_NOT_ALLOWED:
    'A competition tier cannot be its own parent.',
  INVALID_COMPETITION_TIER_SORT: 'Enter a valid competition tier sort value.',
  INVALID_COMPETITION_TIER_STATUS:
    'Select a valid competition tier status.',
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
