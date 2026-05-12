/** @format */

import type { ApiError } from './api';
import type { AuthUser, CurrentSession } from './auth';

export type MeResponse = AuthUser;

export type CurrentSessionResponse = CurrentSession;

export type ProfileVisibility = 'public' | 'private';

export type GetMyProfileResponse = Readonly<{
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  visibility: ProfileVisibility;
  created_at: string;
  updated_at: string;
}>;

export type PutMyProfileRequest = Readonly<{
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  visibility: ProfileVisibility;
}>;

export type PutMyProfileResponse = GetMyProfileResponse;

export type MyContributionSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc';

export type MyContributionReviewStatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected';

export type MyContributionTargetEntityTypeFilter = 'all' | 'stadium' | 'person';

export type MyContributionResponse = Readonly<{
  id: string;
  contribution_type: string;
  target_entity_type: string;
  target_entity_id: string;
  asset_id: string;
  review_status: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}>;

export type MyContributionsListResponse = Readonly<{
  data: ReadonlyArray<MyContributionResponse>;
  metadata: Readonly<{
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    filters: Readonly<{
      sort: MyContributionSort;
      review_status: MyContributionReviewStatusFilter;
      target_entity_type: MyContributionTargetEntityTypeFilter;
    }>;
  }>;
}>;

export type GetMyPointsResponse = Readonly<{
  user_id: string;
  total_points: number;
}>;

export type MyContributionsQuery = Readonly<{
  page?: number;
  page_size?: number;
  sort?: MyContributionSort;
  review_status?: MyContributionReviewStatusFilter;
  target_entity_type?: MyContributionTargetEntityTypeFilter;
}>;

export type MeApiResult<T> = Readonly<{
  data: T | null;
  error?: ApiError;
  statusCode: number;
}>;
