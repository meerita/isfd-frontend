/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type CompetitionSort =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'updated_at_desc'
  | 'updated_at_asc'
  | 'is_public_desc'
  | 'is_public_asc'
  | 'name_desc'
  | 'name_asc'
  | 'sort_order_desc'
  | 'sort_order_asc';

export type CompetitionVisibilityFilter = 'all' | 'public' | 'private';

export type CompetitionAdmin = Readonly<{
  id: string;
  competitionTypeId: string;
  federationId: string | null;
  countryId: string | null;
  code: string;
  slug: string;
  name: string;
  originalName: string | null;
  startedOn: string | null;
  endedOn: string | null;
  sortOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionListItem = CompetitionAdmin;
export type Competition = CompetitionAdmin;

export type CompetitionPublic = Readonly<{
  slug: string;
  name: string;
  originalName: string | null;
  competitionType: Readonly<{
    slug: string;
    code: string;
    name: string;
  }>;
  federation: Readonly<{
    slug: string;
    name: string;
  }> | null;
  country: Readonly<{
    id: string;
    slug: string;
    name: string;
  }> | null;
  startedOn: string | null;
  endedOn: string | null;
}>;

export type CompetitionListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionSort;
      visibility?: CompetitionVisibilityFilter;
      competitionTypeId?: string;
      federationId?: string;
      countryId?: string;
    }>;
  }>;

export type CompetitionListResponse = Readonly<{
  data: ReadonlyArray<CompetitionListItem>;
  metadata: CompetitionListMetadata;
  error?: ApiErrorResponse;
}>;

export type CompetitionDetailResponse = Readonly<{
  data: Competition | null;
  error?: ApiErrorResponse;
}>;

export type CreateCompetitionRequest = Readonly<{
  competition_type_id: string;
  federation_id: string | null;
  country_id: string | null;
  name: string;
  original_name: string | null;
  started_on: string | null;
  ended_on: string | null;
  sort_order: number | null;
  is_public: boolean | null;
}>;

export type UpdateCompetitionRequest = Readonly<{
  competition_type_id?: string;
  federation_id?: string | null;
  country_id?: string | null;
  name?: string;
  original_name?: string | null;
  started_on?: string | null;
  ended_on?: string | null;
  sort_order?: number | null;
  is_public?: boolean;
}>;

export interface CompetitionActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionId?: string;
  competitionSlug?: string;
}
