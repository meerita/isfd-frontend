/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type ClubSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc';

export type ClubStatusFilter = 'all' | 'active' | 'inactive';

export type ClubReference = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

export type ClubListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  shortName: string | null;
  countryId: string | null;
  cityId: string | null;
  primaryStadiumId: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Club = ClubListItem &
  Readonly<{
    acronym: string | null;
    nativeName: string | null;
    foundedAs: string | null;
    foundedAt: string | null;
    dissolvedAt: string | null;
    isDissolved: boolean;
    officialWebsiteUrl: string | null;
    heroImageUrl: string | null;
  }>;

export type PublicClub = Readonly<{
  slug: string;
  name: string;
  shortName: string | null;
  acronym: string | null;
  nativeName: string | null;
  foundedAs: string | null;
  foundedAt: string | null;
  dissolvedAt: string | null;
  isDissolved: boolean;
  country: ClubReference | null;
  city: ClubReference | null;
  primaryStadium: ClubReference | null;
  officialWebsiteUrl: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
}>;

export type ClubListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: ClubSort;
      status?: ClubStatusFilter;
      countryId?: string;
    }>;
  }>;

export type ClubListResponse = Readonly<{
  data: ReadonlyArray<ClubListItem>;
  metadata: ClubListMetadata;
  error?: ApiErrorResponse;
}>;

export type ClubDetailResponse = Readonly<{
  data: Club | null;
  error?: ApiErrorResponse;
}>;

export type PublicClubDetailResponse = Readonly<{
  data: PublicClub | null;
  error?: ApiErrorResponse;
}>;

export interface ClubActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  clubId?: string;
}
