/** @format */

// File: src/_types/country.ts
// Purpose: Country domain types aligned with backend v2 contracts
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';

export type Country = Readonly<{
  id: string;
  name: string;
  slug: string;
  translationKey: string;
  flagImageUrl: string | null;
  iso2Code: string | null;
  iso3Code: string | null;
  continentCode: string | null;
  isActive: boolean;
  // Present in admin list only
  provinceCount?: number;
  cityCount?: number;
}>;

export type GeoMetadata = Readonly<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}>;

export type CountriesResponse = Readonly<{
  data: ReadonlyArray<Country>;
  metadata: GeoMetadata;
}>;

export interface CountryActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
