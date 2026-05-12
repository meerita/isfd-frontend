/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';
import type { CompetitionEditionEditorialStatus } from '@/_constants/enums/competition';

export type CompetitionEditionSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'name_asc'
  | 'name_desc'
  | 'sort_order_asc'
  | 'sort_order_desc'
  | 'year_asc'
  | 'year_desc'
  | 'started_on_asc'
  | 'started_on_desc';

export type CompetitionEditionStatusFilter =
  | 'all'
  | CompetitionEditionEditorialStatus;
export type CompetitionEditionVisibilityFilter = 'all' | 'public' | 'private';

export type CompetitionEdition = Readonly<{
  id: string;
  competitionId: string;
  competitionPyramidId: string | null;
  primaryCompetitionTierId: string | null;
  code: string | null;
  slug: string;
  editionLabel: string | null;
  name: string;
  competitionName: string | null;
  competitionSlug: string | null;
  shortName: string | null;
  year: number | null;
  startedOn: string | null;
  endedOn: string | null;
  editorialStatus: CompetitionEditionEditorialStatus;
  sortOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionEditionPublic = Readonly<{
  slug: string;
  name: string;
  competitionName: string | null;
  competitionSlug: string | null;
  shortName: string | null;
  editionLabel: string | null;
  year: number | null;
  startedOn: string | null;
  endedOn: string | null;
  editorialStatus: CompetitionEditionEditorialStatus;
}>;

export type CompetitionEditionListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionEditionSort;
      status?: CompetitionEditionStatusFilter;
      visibility?: CompetitionEditionVisibilityFilter;
      competitionId?: string;
      competitionPyramidId?: string;
      primaryCompetitionTierId?: string;
      year?: number | null;
      q?: string;
    }>;
  }>;

export type CompetitionEditionListResponse = Readonly<{
  data: ReadonlyArray<CompetitionEdition>;
  metadata: CompetitionEditionListMetadata;
  error?: ApiErrorResponse;
}>;

export type CompetitionEditionDetailResponse = Readonly<{
  data: CompetitionEdition | null;
  error?: ApiErrorResponse;
}>;

export type CreateCompetitionEditionRequest = Readonly<{
  edition_label: string;
  competition_id: string;
  competition_pyramid_id: string | null;
  primary_competition_tier_id: string | null;
}>;

export type UpdateCompetitionEditionRequest = Readonly<{
  competition_id?: string;
  competition_pyramid_id?: string | null;
  primary_competition_tier_id?: string | null;
  edition_label?: string | null;
  short_name?: string | null;
  year?: number | null;
  started_on?: string | null;
  ended_on?: string | null;
  editorial_status?: CompetitionEditionEditorialStatus | null;
  sort_order?: number | null;
  is_public?: boolean;
}>;

export type UpdateCompetitionEditionCodeRequest = Readonly<{
  code: string;
}>;

export interface CompetitionEditionActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionEditionId?: string;
  competitionEditionSlug?: string;
}
