/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type CompetitionSort =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'updated_at_desc'
  | 'updated_at_asc'
  | 'is_active_desc'
  | 'is_active_asc'
  | 'name_desc'
  | 'name_asc'
  | 'sort_order_desc'
  | 'sort_order_asc';

export type CompetitionStatusFilter = 'all' | 'active' | 'inactive';

export type CompetitionListItem = Readonly<{
  id: string;
  competitionTypeId: string;
  federationId: string | null;
  countryId: string | null;
  code: string;
  slug: string;
  name: string;
  startedOn: string | null;
  endedOn: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Competition = CompetitionListItem;

export type CompetitionListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionSort;
      status?: CompetitionStatusFilter;
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
  code: string;
  name: string;
  started_on: string | null;
  ended_on: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}>;

export type UpdateCompetitionRequest = Readonly<{
  competition_type_id?: string;
  federation_id?: string | null;
  country_id?: string | null;
  code?: string;
  name?: string;
  started_on?: string | null;
  ended_on?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}>;

export interface CompetitionActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionId?: string;
}
