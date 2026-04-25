/** @format */

'use server';

// File: src/_actions/auth/getMe.ts
// Purpose: Fetch the authenticated user profile from /api/v1/me
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { AuthUser } from '@/_types/auth';

export async function getMe(): Promise<AuthUser | null> {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: false });

  if (!headers) {
    return null;
  }

  try {
    const { data } = await api.get<AuthUser>(API_ROUTES.ME, { headers });
    return data;
  } catch (error) {
    console.error('Failed to fetch /me', error);
    return null;
  }
}
