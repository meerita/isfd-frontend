/** @format */

import type {
  MyContributionReviewStatusFilter,
  MyContributionSort,
  MyContributionTargetEntityTypeFilter,
} from '@/_types/me';

export const ACCOUNT_SECTION_OPTIONS = [
  'overview',
  'profile',
  'contributions',
  'session',
] as const;

export type AccountSection = (typeof ACCOUNT_SECTION_OPTIONS)[number];

export const MY_CONTRIBUTION_SORT_OPTIONS = [
  'created_at_asc',
  'created_at_desc',
  'updated_at_asc',
  'updated_at_desc',
] as const satisfies ReadonlyArray<MyContributionSort>;

export const MY_CONTRIBUTION_REVIEW_STATUS_OPTIONS = [
  'all',
  'pending',
  'approved',
  'rejected',
] as const satisfies ReadonlyArray<MyContributionReviewStatusFilter>;

export const MY_CONTRIBUTION_TARGET_ENTITY_TYPE_OPTIONS = [
  'all',
  'stadium',
  'person',
] as const satisfies ReadonlyArray<MyContributionTargetEntityTypeFilter>;

export const DEFAULT_ACCOUNT_SECTION: AccountSection = 'overview';
export const DEFAULT_MY_CONTRIBUTIONS_PAGE = 1;
export const DEFAULT_MY_CONTRIBUTIONS_PAGE_SIZE = 20;
export const DEFAULT_MY_CONTRIBUTIONS_SORT: MyContributionSort =
  'created_at_desc';
export const DEFAULT_MY_CONTRIBUTIONS_REVIEW_STATUS: MyContributionReviewStatusFilter =
  'all';
export const DEFAULT_MY_CONTRIBUTIONS_TARGET_ENTITY_TYPE: MyContributionTargetEntityTypeFilter =
  'all';

export function parseAccountSection(
  value: string | undefined,
): AccountSection {
  return (
    ACCOUNT_SECTION_OPTIONS.find(option => option === value) ??
    DEFAULT_ACCOUNT_SECTION
  );
}

export function parseMyContributionSort(
  value: string | undefined,
): MyContributionSort | undefined {
  return MY_CONTRIBUTION_SORT_OPTIONS.find(option => option === value);
}

export function parseMyContributionReviewStatus(
  value: string | undefined,
): MyContributionReviewStatusFilter | undefined {
  return MY_CONTRIBUTION_REVIEW_STATUS_OPTIONS.find(option => option === value);
}

export function parseMyContributionTargetEntityType(
  value: string | undefined,
): MyContributionTargetEntityTypeFilter | undefined {
  return MY_CONTRIBUTION_TARGET_ENTITY_TYPE_OPTIONS.find(
    option => option === value,
  );
}
