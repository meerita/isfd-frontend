/** @format */

import type {
  ContributionAdminReviewStatusFilter,
  ContributionAdminSort,
  ContributionAdminTargetEntityTypeFilter,
} from '@/_types/contribution';

export const CONTRIBUTION_ADMIN_SORT_OPTIONS = [
  'created_at_asc',
  'created_at_desc',
  'updated_at_asc',
  'updated_at_desc',
] as const satisfies ReadonlyArray<ContributionAdminSort>;

export const CONTRIBUTION_ADMIN_REVIEW_STATUS_FILTER_OPTIONS = [
  'all',
  'pending',
  'approved',
  'rejected',
] as const satisfies ReadonlyArray<ContributionAdminReviewStatusFilter>;

export const CONTRIBUTION_ADMIN_TARGET_ENTITY_TYPE_FILTER_OPTIONS = [
  'all',
  'stadium',
  'person',
] as const satisfies ReadonlyArray<ContributionAdminTargetEntityTypeFilter>;

export function parseContributionAdminSort(
  value: string | undefined,
): ContributionAdminSort | undefined {
  return CONTRIBUTION_ADMIN_SORT_OPTIONS.find(option => option === value);
}

export function parseContributionAdminReviewStatusFilter(
  value: string | undefined,
): ContributionAdminReviewStatusFilter | undefined {
  return CONTRIBUTION_ADMIN_REVIEW_STATUS_FILTER_OPTIONS.find(
    option => option === value,
  );
}

export function parseContributionAdminTargetEntityTypeFilter(
  value: string | undefined,
): ContributionAdminTargetEntityTypeFilter | undefined {
  return CONTRIBUTION_ADMIN_TARGET_ENTITY_TYPE_FILTER_OPTIONS.find(
    option => option === value,
  );
}
