/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type ContributionReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ContributionType =
  | 'STADIUM_IMAGE_SUBMISSION'
  | 'PERSON_PORTRAIT_SUBMISSION';

export type ContributionTargetEntityType = 'STADIUM' | 'PERSON';

export type ContributionAdminSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc';

export type ContributionAdminReviewStatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected';

export type ContributionAdminTargetEntityTypeFilter =
  | 'all'
  | 'stadium'
  | 'person';

export type ContributionAdminItem = Readonly<{
  id: string;
  submittedByUserId: string;
  contributionType: ContributionType;
  targetEntityType: ContributionTargetEntityType;
  targetEntityId: string;
  assetId: string;
  reviewStatus: ContributionReviewStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type ContributionAdminDetail = ContributionAdminItem;

export type ContributionAdminListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: ContributionAdminSort;
      reviewStatus?: ContributionAdminReviewStatusFilter;
      targetEntityType?: ContributionAdminTargetEntityTypeFilter;
    }>;
  }>;

export type ContributionAdminListResponse = Readonly<{
  data: ReadonlyArray<ContributionAdminItem>;
  metadata: ContributionAdminListMetadata;
  error?: ApiErrorResponse;
}>;

export type ContributionAdminDetailResponse = Readonly<{
  data: ContributionAdminDetail | null;
  error?: ApiErrorResponse;
}>;

export type ContributionReviewResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;
