/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';
import type {
  CompetitionTypeCategory,
  ParticipantScope,
} from '@/_constants/enums/competition';

export type CompetitionTypeSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc'
  | 'sort_order_asc'
  | 'sort_order_desc';
export type CompetitionTypeStatusFilter = 'all' | 'active' | 'inactive';

export type CompetitionTypeListItem = Readonly<{
  id: string;
  code: string;
  slug: string;
  name: string;
  competitionTypeCategory: CompetitionTypeCategory;
  participantScope: ParticipantScope;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionType = CompetitionTypeListItem;

export type CompetitionTypeListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionTypeSort;
      status?: CompetitionTypeStatusFilter;
      competitionTypeCategory?: string;
      participantScope?: string;
    }>;
  }>;

export type CompetitionTypeListResponse = Readonly<{
  data: ReadonlyArray<CompetitionTypeListItem>;
  metadata: CompetitionTypeListMetadata;
  error?: ApiErrorResponse;
}>;

export type CompetitionTypeDetailResponse = Readonly<{
  data: CompetitionType | null;
  error?: ApiErrorResponse;
}>;

export type CreateCompetitionTypeRequest = Readonly<{
  code: string;
  name: string;
  competition_type_category: CompetitionTypeCategory;
  participant_scope: ParticipantScope;
  sort_order?: number | null;
  is_active?: boolean | null;
}>;

export type UpdateCompetitionTypeRequest = Readonly<{
  name?: string;
  competition_type_category?: CompetitionTypeCategory | null;
  participant_scope?: ParticipantScope | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}>;

export interface CompetitionTypeActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionTypeId?: string;
}
