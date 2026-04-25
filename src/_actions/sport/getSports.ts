/** @format */

'use server';

// File: src/_actions/sport/getSports.ts
// Purpose: Fetch paginated sports list from the admin endpoint using auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { SportStatus, SportsResponse } from '@/_types/sport';

type SportsQuery = Readonly<{
  page?: number;
  limit?: number;
  visible?: boolean;
  popular?: boolean;
  status?: SportStatus;
  search?: string;
}>;

const DEFAULT_QUERY: Readonly<{ page: number; limit: number }> = {
  page: 1,
  limit: 20,
};

const EMPTY_SPORTS_RESPONSE: SportsResponse = {
  data: [],
  pagination: {
    page: DEFAULT_QUERY.page,
    limit: DEFAULT_QUERY.limit,
    totalItems: 0,
    totalPages: 0,
  },
};

function buildParams(
  query: SportsQuery,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page: query.page ?? DEFAULT_QUERY.page,
    limit: query.limit ?? DEFAULT_QUERY.limit,
  };

  if (typeof query.visible === 'boolean') {
    params.visible = query.visible;
  }

  if (typeof query.popular === 'boolean') {
    params.popular = query.popular;
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.search && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}

export async function getSports(
  query: SportsQuery = {},
): Promise<SportsResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<SportsResponse>(API_ROUTES.SPORTS_ADMIN, {
      params: buildParams(query),
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return data;
  } catch (error) {
    console.error('Failed to fetch sports', error);
    return EMPTY_SPORTS_RESPONSE;
  }
}
