/** @format */

'use server';

// File: src/_actions/group/getGroups.ts
// Purpose: Fetch paginated groups list from the admin endpoint using auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { normalizeGroupVisibility } from '@/_helpers/normalizeGroupVisibility';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type {
  GroupPrivacy,
  GroupsResponse,
  GroupStatus,
  GroupVisibility,
} from '@/_types/group';

type GroupsQuery = Readonly<{
  page?: number;
  limit?: number;
  privacy?: GroupPrivacy;
  visibility?: GroupVisibility;
  status?: GroupStatus;
  search?: string;
  sport?: string;
}>;

const DEFAULT_QUERY: Readonly<{ page: number; limit: number }> = {
  page: 1,
  limit: 20,
};

const EMPTY_GROUPS_RESPONSE: GroupsResponse = {
  data: [],
  pagination: {
    page: DEFAULT_QUERY.page,
    limit: DEFAULT_QUERY.limit,
    totalItems: 0,
    totalPages: 0,
  },
};

function buildParams(query: GroupsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? DEFAULT_QUERY.page,
    limit: query.limit ?? DEFAULT_QUERY.limit,
  };

  if (query.privacy) {
    params.privacy = query.privacy;
  }

  if (query.visibility) {
    params.visibility = normalizeGroupVisibility(query.visibility);
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.sport && query.sport.trim().length > 0) {
    params.sport = query.sport.trim();
  }

  if (query.search && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}

export async function getGroups(
  query: GroupsQuery = {},
): Promise<GroupsResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<GroupsResponse>(API_ROUTES.GROUPS, {
      params: buildParams(query),
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return data;
  } catch (error) {
    console.error('Failed to fetch groups', error);
    return EMPTY_GROUPS_RESPONSE;
  }
}
