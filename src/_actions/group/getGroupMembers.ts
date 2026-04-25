/** @format */

'use server';

// File: src/_actions/group/getGroupMembers.ts
// Purpose: Fetch the members of a single group by id using server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { normalizeGroupMembersPayload } from '@/_helpers/normalizeGroupMembers';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { GroupMember } from '@/_types/group';

export async function getGroupMembers(
  groupId: string,
): Promise<ReadonlyArray<GroupMember>> {
  const normalizedGroupId = groupId?.trim();

  if (!normalizedGroupId) {
    return [];
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.GROUP_MEMBERS(normalizedGroupId),
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return normalizeGroupMembersPayload(data);
  } catch (error) {
    console.error(
      `Failed to fetch members for group with id ${normalizedGroupId}`,
      error,
    );
    return [];
  }
}
