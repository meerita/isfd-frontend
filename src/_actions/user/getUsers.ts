/** @format */

'use server';

// File: src/_actions/user/getUsers.ts
// Purpose: Fetch paginated users list while wiring auth cookies on the server
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { UsersResponse } from '@/_types/user';

const DEFAULT_QUERY: Readonly<{ page: number; limit: number }> = {
  page: 1,
  limit: 20,
};

const EMPTY_USERS_RESPONSE: UsersResponse = {
  data: [],
  pagination: {
    page: DEFAULT_QUERY.page,
    limit: DEFAULT_QUERY.limit,
    totalItems: 0,
    totalPages: 0,
  },
};

export async function getUsers(
  query: Partial<typeof DEFAULT_QUERY> = DEFAULT_QUERY,
): Promise<UsersResponse> {
  const { page = DEFAULT_QUERY.page, limit = DEFAULT_QUERY.limit } = query;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<UsersResponse>(API_ROUTES.USERS, {
      params: { page, limit },
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    return EMPTY_USERS_RESPONSE;
  }
}
