/** @format */

// File: src/_types/city.ts
// Purpose: City domain types aligned with backend v2 contracts
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type AdminCityStatus = 'all' | 'active' | 'inactive';

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

export type CitiesResponse = Readonly<{
  data: ReadonlyArray<City>;
  metadata: GeoMetadata;
}>;

export type AdminCitiesResponse = CitiesResponse;

export interface CityActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
