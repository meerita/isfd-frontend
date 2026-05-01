/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';
import type { CompetitionEditionStatus } from '@/_constants/enums/competition';

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
  | CompetitionEditionStatus;
export type CompetitionEditionActiveStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export type CompetitionEdition = Readonly<{
  id: string;
  competitionId: string | null;
  seasonId: string | null;
  code: string | null;
  slug: string;
  editionLabel: string | null;
  name: string;
  shortName: string | null;
  year: number | null;
  startedOn: string | null;
  endedOn: string | null;
  status: CompetitionEditionStatus;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionEditionListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionEditionSort;
      status?: CompetitionEditionStatusFilter;
      activeStatus?: CompetitionEditionActiveStatusFilter;
      competitionId?: string;
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
  name: string;
  season_id: string | null;
}>;

export type UpdateCompetitionEditionRequest = Readonly<{
  competition_id?: string | null;
  season_id?: string | null;
  edition_label?: string | null;
  name?: string;
  short_name?: string | null;
  year?: number | null;
  started_on?: string | null;
  ended_on?: string | null;
  status?: CompetitionEditionStatus | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}>;

export type UpdateCompetitionEditionCodeRequest = Readonly<{
  code: string;
}>;

export interface CompetitionEditionActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionEditionId?: string;
}
