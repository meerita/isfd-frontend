/** @format */

import type {
  ContributionAdminItem,
  ContributionAdminListMetadata,
  ContributionAdminReviewStatusFilter,
  ContributionAdminSort,
  ContributionAdminTargetEntityTypeFilter,
  ContributionReviewStatus,
  ContributionTargetEntityType,
  ContributionType,
} from '@/_types/contribution';

type RawContribution = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapContribution(raw: RawContribution): ContributionAdminItem {
  return {
    id: toStringValue(raw.id),
    submittedByUserId: toStringValue(
      raw.submitted_by_user_id ?? raw.submittedByUserId,
    ),
    contributionType: toStringValue(
      raw.contribution_type ?? raw.contributionType,
    ) as ContributionType,
    targetEntityType: toStringValue(
      raw.target_entity_type ?? raw.targetEntityType,
    ) as ContributionTargetEntityType,
    targetEntityId: toStringValue(raw.target_entity_id ?? raw.targetEntityId),
    assetId: toStringValue(raw.asset_id ?? raw.assetId),
    reviewStatus: toStringValue(
      raw.review_status ?? raw.reviewStatus,
    ) as ContributionReviewStatus,
    reviewedByUserId: toNullableString(
      raw.reviewed_by_user_id ?? raw.reviewedByUserId,
    ),
    reviewedAt: toNullableString(raw.reviewed_at ?? raw.reviewedAt),
    createdAt: toStringValue(raw.created_at ?? raw.createdAt),
    updatedAt: toStringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function mapContributionMetadata(
  raw: Record<string, unknown>,
): ContributionAdminListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: filters
      ? {
          sort:
            typeof filters.sort === 'string'
              ? (filters.sort as ContributionAdminSort)
              : undefined,
          reviewStatus:
            typeof filters.review_status === 'string'
              ? (filters.review_status as ContributionAdminReviewStatusFilter)
              : typeof filters.reviewStatus === 'string'
                ? (filters.reviewStatus as ContributionAdminReviewStatusFilter)
                : undefined,
          targetEntityType:
            typeof filters.target_entity_type === 'string'
              ? (filters.target_entity_type as ContributionAdminTargetEntityTypeFilter)
              : typeof filters.targetEntityType === 'string'
                ? (filters.targetEntityType as ContributionAdminTargetEntityTypeFilter)
                : undefined,
        }
      : undefined,
  };
}
