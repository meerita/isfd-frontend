/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { ContinentCode } from '@/_constants/continents';

export type CountrySort =
  | 'name_asc'
  | 'name_desc'
  | 'updated_at_asc'
  | 'updated_at_desc';

export type CountryStatusFilter = 'all' | 'active' | 'inactive';

export type Country = Readonly<{
  id: string;
  name: string;
  slug: string;
  translationKey: string;
  flagImageUrl: string | null;
  iso2Code: string | null;
  iso3Code: string | null;
  continentCode: ContinentCode | null;
  isActive: boolean;
  provinceCount?: number;
  cityCount?: number;
}>;

export type CountrySelectOption = Readonly<Pick<Country, 'id' | 'name'>>;

export type ProvinceAdmin = Readonly<{
  name: string;
  activeCityCount: number;
  inactiveCityCount: number;
}>;

export type GeoMetadata = Readonly<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}>;

export type CountryListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CountrySort;
      status?: CountryStatusFilter;
    }>;
  }>;

export type CountriesResponse = Readonly<{
  data: ReadonlyArray<Country>;
  metadata: CountryListMetadata;
  error?: ApiErrorResponse;
}>;

export type CountryDetailResponse = Readonly<{
  data: Country | null;
  error?: ApiErrorResponse;
}>;

export type ProvincesAdminResponse = Readonly<{
  data: ReadonlyArray<ProvinceAdmin>;
}>;

export interface CountryActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  countryId?: string;
}
