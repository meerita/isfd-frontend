/** @format */

// File: src/_types/city.ts
// Purpose: Shared city domain types for API responses
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Continent } from '@/_constants/continents';
import type { ApiErrorResponse } from '@/_types/api';

export type City = Readonly<{
  id: string;
  name: string;
  countryCode: string;
  country: string;
  continent: Continent;
  province?: string;
  capital?: boolean;
  latitude?: number;
  longitude?: number;
  coordinates?: Readonly<{
    lat: number;
    lng: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}>;

export type CitiesPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type CitiesResponse = Readonly<{
  data: ReadonlyArray<City>;
  pagination?: CitiesPagination;
}>;

export interface CityActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
