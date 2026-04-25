/** @format */

'use server';

// File: src/_actions/sport/getSportById.ts
// Purpose: Fetch a single sport by id reusing server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Sport } from '@/_types/sport';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSport(value: unknown): value is Sport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.localizedName === 'string'
  );
}

function normalizeSport(payload: unknown): Sport | null {
  if (isSport(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (isSport(payload.data)) {
      return payload.data;
    }

    if (isSport(payload.sport)) {
      return payload.sport;
    }
  }

  return null;
}

export async function getSportById(sportId: string): Promise<Sport | null> {
  if (!sportId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.SPORT_ADMIN_BY_ID(sportId),
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return normalizeSport(data);
  } catch (error) {
    console.error(`Failed to fetch sport with id ${sportId}`, error);
    return null;
  }
}
