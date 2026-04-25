/** @format */

'use server';

// File: src/_actions/place/getPlacesList.ts
// Purpose: Fetch the authenticated paginated places list for the admin dashboard
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { extractPlaces } from '@/_helpers/extractPlaces';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { PlacesResponse } from '@/_types/place';

type PlacesListQuery = Readonly<{
  page?: number;
  limit?: number;
  name?: string;
  sportId?: string;
  status?: string;
  province?: string;
  country?: string;
  cityID?: string;
}>;

const DEFAULT_QUERY: Readonly<{ page: number; limit: number }> = {
  page: 1,
  limit: 20,
};

const EMPTY_PLACES_RESPONSE: PlacesResponse = {
  data: [],
  pagination: {
    page: DEFAULT_QUERY.page,
    limit: DEFAULT_QUERY.limit,
    totalItems: 0,
    totalPages: 0,
  },
};

function buildParams(
  query: PlacesListQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? DEFAULT_QUERY.page,
    limit: query.limit ?? DEFAULT_QUERY.limit,
  };

  if (query.name?.trim()) {
    params.name = query.name.trim();
  }

  if (query.sportId?.trim()) {
    params.sportId = query.sportId.trim();
  }

  if (query.status?.trim()) {
    params.status = query.status.trim();
  }

  if (query.province?.trim()) {
    params.province = query.province.trim();
  }

  if (query.country?.trim()) {
    params.country = query.country.trim();
  }

  if (query.cityID?.trim()) {
    params.cityID = query.cityID.trim();
  }

  return params;
}

export async function getPlacesList(
  query: PlacesListQuery = {},
): Promise<PlacesResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.PLACES, {
      params: buildParams(query),
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    const places = extractPlaces(data);
    const pagination =
      typeof data === 'object' && data !== null && 'pagination' in data
        ? (data.pagination as Partial<PlacesResponse['pagination']>)
        : undefined;

    return {
      data: places,
      pagination: {
        page: pagination?.page ?? (query.page ?? DEFAULT_QUERY.page),
        limit: pagination?.limit ?? (query.limit ?? DEFAULT_QUERY.limit),
        totalItems: pagination?.totalItems ?? places.length,
        totalPages: pagination?.totalPages ?? 1,
      },
    } satisfies PlacesResponse;
  } catch (error) {
    console.error('Failed to fetch places list', error);
    return EMPTY_PLACES_RESPONSE;
  }
}
