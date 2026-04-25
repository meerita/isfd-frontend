/** @format */

// File: src/_types/country.ts
// Purpose: Shared country domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Continent } from '@/_constants/continents';
import type { ApiErrorResponse } from '@/_types/api';

export type Country = Readonly<{
  id: string;
  countryCode: string;
  name: string;
  localizedName: string;
  continent: Continent;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  provinces?: ReadonlyArray<string>;
  coordinates?: Readonly<{
    lat: number;
    lng: number;
  }>;
}>;

export type CountriesPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type CountriesResponse = Readonly<{
  data: ReadonlyArray<Country>;
  pagination: CountriesPagination;
}>;

export interface CountryActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
