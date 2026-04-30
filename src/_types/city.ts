/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type AdminCitySort =
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'slug_asc'
  | 'slug_desc';

export type CityStatusFilter = 'all' | 'active' | 'inactive';
export type AdminCityStatus = CityStatusFilter;

export type City = Readonly<{
  id: string;
  countryId: string;
  countryName: string | null;
  name: string;
  slug: string;
  translationKey: string;
  regionName: string | null;
  provinceName: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}>;

export type CityListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      countryId?: string;
      province?: string;
      sort?: AdminCitySort;
      status?: CityStatusFilter;
    }>;
  }>;

export type CitiesResponse = Readonly<{
  data: ReadonlyArray<City>;
  metadata: CityListMetadata;
  error?: ApiErrorResponse;
}>;

export type AdminCitiesResponse = CitiesResponse;

export type CityDetailResponse = Readonly<{
  data: City | null;
  error?: ApiErrorResponse;
}>;

export interface CityActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  cityId?: string;
}
