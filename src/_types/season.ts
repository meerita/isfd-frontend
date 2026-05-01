/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type SeasonSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'name_asc'
  | 'name_desc'
  | 'start_year_asc'
  | 'start_year_desc';
export type SeasonStatusFilter = 'all' | 'active' | 'inactive';

export type SeasonListItem = Readonly<{
  id: string;
  code: string;
  slug: string;
  name: string;
  startYear: number;
  endYear: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Season = SeasonListItem;

export type SeasonListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: SeasonSort;
      status?: SeasonStatusFilter;
      year?: number | null;
    }>;
  }>;

export type SeasonListResponse = Readonly<{
  data: ReadonlyArray<SeasonListItem>;
  metadata: SeasonListMetadata;
  error?: ApiErrorResponse;
}>;

export type SeasonDetailResponse = Readonly<{
  data: Season | null;
  error?: ApiErrorResponse;
}>;

export type CreateSeasonRequest = Readonly<{
  code: string;
  name: string;
  start_year: number;
  end_year: number | null;
  is_active?: boolean | null;
}>;

export type UpdateSeasonRequest = Readonly<{
  name?: string;
  start_year?: number;
  end_year?: number | null;
  is_active?: boolean | null;
}>;

export interface SeasonActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  seasonId?: string;
}
