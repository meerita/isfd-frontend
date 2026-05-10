/** @format */

import type { ApiError, ApiErrorResponse } from '@/_types/api';
import {
  STADIUM_SURFACE_TYPES,
  type StadiumSurfaceType,
} from '@/_constants/enums/stadium';

export { STADIUM_SURFACE_TYPES, type StadiumSurfaceType };

export type StadiumPublicSort = 'name_asc' | 'name_desc' | 'updated_at_desc';

export type StadiumAdminSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_public_asc'
  | 'is_public_desc'
  | 'name_asc'
  | 'name_desc';

export type StadiumStatusFilter = 'all' | 'public' | 'private';

export type StadiumPrimaryImageResponse = Readonly<{
  id: string;
  asset_id: string;
  url: string;
  width: number;
  height: number;
}>;

export type StadiumImageResponse = StadiumPrimaryImageResponse &
  Readonly<{
    is_primary: boolean;
    sort_order: number;
  }>;

export type GeoRefResponse = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

export type ClubRefResponse = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

export type StadiumPublic = Readonly<{
  slug: string;
  name: string;
  former_names: ReadonlyArray<string>;
  primary_image: StadiumPrimaryImageResponse | null;
  images: ReadonlyArray<StadiumImageResponse> | null;
  official_website_url?: string | null;
  country: GeoRefResponse | null;
  city: GeoRefResponse | null;
  primary_club: ClubRefResponse | null;
  seat_count?: number | null;
  surface_type?: StadiumSurfaceType | null;
  pitch_length_meters?: number | null;
  pitch_width_meters?: number | null;
  opened_on?: string | null;
  closed_on?: string | null;
  is_indoor: boolean | null;
  is_roofed: boolean | null;
}>;

export type StadiumPublicListItem = Readonly<{
  slug: string;
  name: string;
  former_names: ReadonlyArray<string>;
  primary_image: StadiumPrimaryImageResponse | null;
  country: GeoRefResponse | null;
  city: GeoRefResponse | null;
  primary_club: ClubRefResponse | null;
  seat_count?: number | null;
  surface_type?: StadiumSurfaceType | null;
}>;

type PaginationMetadata = Readonly<{
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}>;

export type StadiumPublicListMetadata = PaginationMetadata;

export type StadiumPublicListResponse = Readonly<{
  data: ReadonlyArray<StadiumPublicListItem>;
  metadata: StadiumPublicListMetadata;
  error?: ApiErrorResponse;
}>;

export type StadiumPublicDetailResponse = Readonly<{
  data: StadiumPublic | null;
  error?: ApiErrorResponse;
}>;

export type StadiumAdminListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  former_names: ReadonlyArray<string>;
  primary_image: StadiumPrimaryImageResponse | null;
  country_id?: string | null;
  city_id?: string | null;
  primary_club_id?: string | null;
  seat_count?: number | null;
  surface_type?: StadiumSurfaceType | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}>;

export type StadiumAdminDetail = StadiumAdminListItem &
  Readonly<{
    images: ReadonlyArray<StadiumImageResponse> | null;
    official_website_url?: string | null;
    pitch_length_meters?: number | null;
    pitch_width_meters?: number | null;
    opened_on?: string | null;
    closed_on?: string | null;
    is_indoor: boolean | null;
    is_roofed: boolean | null;
  }>;

export type Stadium = StadiumAdminDetail;

export type StadiumAdminListMetadata = PaginationMetadata &
  Readonly<{
    filters: Readonly<{
      sort: StadiumAdminSort;
      status: StadiumStatusFilter;
      country_id: string | null;
      city_id: string | null;
      primary_club_id: string | null;
    }>;
  }>;

export type StadiumAdminListResponse = Readonly<{
  data: ReadonlyArray<StadiumAdminListItem>;
  metadata: StadiumAdminListMetadata;
  error?: ApiErrorResponse;
}>;

export type StadiumAdminDetailResponse = Readonly<{
  data: StadiumAdminDetail | null;
  error?: ApiErrorResponse;
}>;

export type CreateStadiumRequest = Readonly<{
  name: string;
  former_names?: string[];
  official_website_url?: string | null;
  country_id?: string | null;
  city_id?: string | null;
  primary_club_id?: string | null;
  seat_count?: number | null;
  surface_type?: StadiumSurfaceType | null;
  pitch_length_meters?: number | null;
  pitch_width_meters?: number | null;
  opened_on?: string | null;
  closed_on?: string | null;
  is_indoor?: boolean | null;
  is_roofed?: boolean | null;
  is_public?: boolean | null;
}>;

export type UpdateStadiumRequest = Readonly<{
  name?: string;
  former_names?: string[] | null;
  official_website_url?: string | null;
  country_id?: string | null;
  city_id?: string | null;
  primary_club_id?: string | null;
  seat_count?: number | null;
  surface_type?: StadiumSurfaceType | null;
  pitch_length_meters?: number | null;
  pitch_width_meters?: number | null;
  opened_on?: string | null;
  closed_on?: string | null;
  is_indoor?: boolean | null;
  is_roofed?: boolean | null;
  is_public?: boolean;
}>;

export type UploadStadiumImagesResponse = Readonly<{
  stadium_id: string;
  images: ReadonlyArray<
    Readonly<{
      attachment_id: string;
      asset_id: string;
      asset_job_id: string;
      is_primary: boolean;
      sort_order: number;
      created_at: string;
    }>
  >;
}>;

export type UploadStadiumImageTicket = UploadStadiumImagesResponse['images'][number];

export type StadiumApiError = ApiError;

export interface StadiumActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  stadiumId?: string;
}

export interface StadiumImageActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  stadiumId?: string;
  pendingImages?: ReadonlyArray<UploadStadiumImageTicket>;
}
