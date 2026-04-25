/** @format */

'use server';

// File: src/_actions/place/getPlaceById.ts
// Purpose: Fetch a single place by id reusing server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Place } from '@/_types/place';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPlace = (value: unknown): value is Place => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.name === 'string';
};

const normalizePlace = (payload: unknown): Place | null => {
  if (isPlace(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (isPlace(payload.data)) {
      return payload.data;
    }

    if (isPlace(payload.place)) {
      return payload.place;
    }
  }

  return null;
};

export async function getPlaceById(placeId: string): Promise<Place | null> {
  if (!placeId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.PLACE_BY_ID(placeId), {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return normalizePlace(data);
  } catch (error) {
    console.error(`Failed to fetch place with id ${placeId}`, error);
    return null;
  }
}
