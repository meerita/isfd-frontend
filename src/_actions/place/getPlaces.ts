/** @format */

'use server';

// File: src/_actions/place/getPlaces.ts
// Purpose: Fetch places either by city id or by coordinates for the admin list
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { extractPlaces } from '@/_helpers/extractPlaces';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Place } from '@/_types/place';

type PlacesQuery = Readonly<
  | {
      cityId: string;
      lat?: never;
      lng?: never;
      radiusMeters?: never;
      limit?: never;
    }
  | {
      cityId?: undefined;
      lat: number;
      lng: number;
      radiusMeters: number;
      limit: number;
    }
>;

export async function getPlaces(query: PlacesQuery): Promise<ReadonlyArray<Place>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  try {
    if ('cityId' in query && query.cityId) {
      const { data } = await api.get<unknown>(API_ROUTES.PLACES_BY_CITY(query.cityId), {
        headers,
      });

      return extractPlaces(data);
    }

    const { data } = await api.get<unknown>(API_ROUTES.PLACES_SEARCH, {
      params: {
        lat: query.lat,
        lng: query.lng,
        radiusMeters: query.radiusMeters,
        limit: query.limit,
      },
      headers,
    });

    return extractPlaces(data);
  } catch (error) {
    console.error('Failed to fetch places', error);
    return [];
  }
}
