/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type FederationLevel = 'WORLD' | 'CONTINENTAL' | 'NATIONAL';

export type FederationSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc';

export type FederationStatusFilter = 'all' | 'active' | 'inactive';

export type FederationListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  federationLevel: FederationLevel;
  iconUrl: string | null;
  countryId: string | null;
  cityId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Federation = FederationListItem &
  Readonly<{
    nativeName: string | null;
    shortName: string | null;
    acronym: string | null;
    foundationDate: string | null;
    description: string | null;
    officialWebsiteUrl: string | null;
    heroImageUrl: string | null;
  }>;

export type FederationListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: FederationSort;
      status?: FederationStatusFilter;
      federationLevel?: FederationLevel;
    }>;
  }>;

export type FederationListResponse = Readonly<{
  data: ReadonlyArray<FederationListItem>;
  metadata: FederationListMetadata;
  error?: ApiErrorResponse;
}>;

export type FederationDetailResponse = Readonly<{
  data: Federation | null;
  error?: ApiErrorResponse;
}>;

export interface FederationActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  federationId?: string;
}
