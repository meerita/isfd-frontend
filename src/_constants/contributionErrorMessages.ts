/** @format */

import type { ApiErrorResponse } from '@/_types/api';

export type ContributionErrorMessageMap = Readonly<Record<string, string>>;

export const CONTRIBUTION_ERROR_MESSAGES: ContributionErrorMessageMap = {
  INVALID_REQUEST: 'The contribution request was invalid.',
  INVALID_PAGINATION: 'The contributions pagination values were invalid.',
  INVALID_SORT: 'The contributions sort value was invalid.',
  INVALID_REVIEW_STATUS: 'The contribution review status filter was invalid.',
  INVALID_TARGET_ENTITY_TYPE: 'The contribution target entity filter was invalid.',
  CONTRIBUTION_ID_REQUIRED: 'Contribution identifier is required.',
  CONTRIBUTION_TARGET_ENTITY_ID_REQUIRED:
    'Contribution target entity identifier is required.',
  CONTRIBUTION_SUBMITTED_BY_USER_ID_REQUIRED:
    'The submitting user identifier is required.',
  CONTRIBUTION_REVIEWED_BY_USER_ID_REQUIRED:
    'The reviewing user identifier is required.',
  CONTRIBUTION_NOT_FOUND: 'This contribution could not be found.',
  CONTRIBUTION_ALREADY_REVIEWED: 'This contribution has already been reviewed.',
  CONTRIBUTION_UNSUPPORTED_TARGET_ENTITY_TYPE:
    'This contribution target entity type is not supported in this flow.',
  ASSET_NOT_FOUND: 'The linked asset could not be found.',
  STADIUM_NOT_FOUND: 'The linked stadium could not be found.',
  FORBIDDEN: 'You do not have permission to review contributions.',
  UNAUTHORIZED: 'You must sign in to continue.',
  INVALID_RESPONSE: 'The backend returned an invalid contribution response.',
};

export function resolveContributionErrorMessage(
  error?: ApiErrorResponse,
  messages: ContributionErrorMessageMap = CONTRIBUTION_ERROR_MESSAGES,
  fallback = 'Unexpected error.',
): string {
  if (!error) {
    return fallback;
  }

  return messages[error.reason] ?? error.error ?? error.message ?? fallback;
}
