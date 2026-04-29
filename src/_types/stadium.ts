/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type StadiumSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc';

export type StadiumStatusFilter = 'all' | 'active' | 'inactive';

export const STADIUM_SURFACE_TYPES = [
  'NATURAL_GRASS',
  'ARTIFICIAL_TURF',
  'HYBRID',
  'CLAY',
  'SAND',
  'CONCRETE',
  'OTHER',
] as const;

export type StadiumSurfaceType = (typeof STADIUM_SURFACE_TYPES)[number];

export type StadiumListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  formerNames: ReadonlyArray<string>;
  countryId: string | null;
  cityId: string | null;
  primaryClubId: string | null;
  imageUrl: string | null;
  seatCount: number | null;
  surfaceType: StadiumSurfaceType | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Stadium = StadiumListItem;

export type StadiumListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: StadiumSort;
      status?: StadiumStatusFilter;
      countryId?: string;
      cityId?: string;
      primaryClubId?: string;
    }>;
  }>;

export type StadiumListResponse = Readonly<{
  data: ReadonlyArray<StadiumListItem>;
  metadata: StadiumListMetadata;
  error?: ApiErrorResponse;
}>;

export type StadiumDetailResponse = Readonly<{
  data: Stadium | null;
  error?: ApiErrorResponse;
}>;

export interface StadiumActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  stadiumId?: string;
}
