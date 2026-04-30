/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type BrandSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc';

export type BrandStatusFilter = 'all' | 'active' | 'inactive';

export type BrandListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Brand = BrandListItem &
  Readonly<{
    websiteUrl: string | null;
    iconImageUrl: string | null;
    detailImageUrl: string | null;
  }>;

export type BrandListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: BrandSort;
      status?: BrandStatusFilter;
    }>;
  }>;

export type BrandListResponse = Readonly<{
  data: ReadonlyArray<BrandListItem>;
  metadata: BrandListMetadata;
  error?: ApiErrorResponse;
}>;

export type BrandDetailResponse = Readonly<{
  data: Brand | null;
  error?: ApiErrorResponse;
}>;

export interface BrandActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  brandId?: string;
}
