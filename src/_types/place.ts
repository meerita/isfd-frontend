/** @format */

// File: src/_types/place.ts
// Purpose: Shared place domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';

export type PlaceVisibility = 'PUBLIC' | 'PRIVATE' | string;

export type PlaceCoordinates = Readonly<{
  lat?: number;
  lng?: number;
}>;

export type PlaceAddress = Readonly<{
  street?: string;
  streetNumber?: string;
  postalCode?: string;
  formatted?: string;
}>;

export type PlaceContact = Readonly<{
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
}>;

export type PlaceExternalIDs = Readonly<{
  googlePlaceID?: string;
  applePlaceID?: string;
}>;

export type PlaceOpeningHourDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type PlaceOpeningHourRange = Readonly<{
  opensAt: string;
  closesAt: string;
}>;

export type PlaceOpeningHour = Readonly<{
  day: PlaceOpeningHourDay;
  ranges: ReadonlyArray<PlaceOpeningHourRange>;
}>;

export type PlaceCity = Readonly<{
  id?: string;
  name?: string;
  countryCode?: string;
}>;

export type Place = Readonly<{
  id: string;
  name: string;
  description?: string;
  cityID?: string;
  cityId?: string;
  city?: PlaceCity | string;
  coordinates?: PlaceCoordinates;
  location?: Readonly<{
    type?: string;
    coordinates?: ReadonlyArray<number>;
  }>;
  address?: PlaceAddress;
  sportIDs?: ReadonlyArray<string>;
  sportIds?: ReadonlyArray<string>;
  status?: string;
  avatarURL?: string;
  avatarUrl?: string;
  images?: ReadonlyArray<string>;
  contact?: PlaceContact;
  externalIDs?: PlaceExternalIDs;
  externalIds?: PlaceExternalIDs;
  openingHours?: ReadonlyArray<PlaceOpeningHour>;
  ownerID?: string;
  ownerId?: string;
  visibility?: PlaceVisibility;
  amenities?: ReadonlyArray<string>;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}>;

export type PlacesPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type PlacesResponse = Readonly<{
  data?: ReadonlyArray<Place>;
  results?: ReadonlyArray<Place>;
  pagination: PlacesPagination;
}>;

export interface PlaceActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  placeId?: string;
}
