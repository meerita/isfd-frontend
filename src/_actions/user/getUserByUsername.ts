/** @format */

'use server';

// File: src/_actions/user/getUserByUsername.ts
// Purpose: Fetch a single user by username using server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { User } from '@/_types/user';

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const normalizedUsername = username?.trim();

  if (!normalizedUsername) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<User>(API_ROUTES.USER_BY_USERNAME, {
      params: { value: normalizedUsername },
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return data;
  } catch (error) {
    console.error(
      `Failed to fetch user with username ${normalizedUsername}`,
      error,
    );
    return null;
  }
}
