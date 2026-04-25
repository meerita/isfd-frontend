/** @format */

'use server';

// File: src/_actions/group/getGroupById.ts
// Purpose: Fetch a single group by id using server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { extractGroupMembers } from '@/_helpers/normalizeGroupMembers';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Group } from '@/_types/group';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGroup(value: unknown): value is Group {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.name === 'string';
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getStringValue(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];

  return isString(value) ? value : undefined;
}

function normalizeGroupRecord(record: Record<string, unknown>): Group | null {
  if (!isGroup(record)) {
    return null;
  }

  const members = extractGroupMembers(record);

  return {
    ...record,
    members,
  } as Group;
}

function normalizeGroup(payload: unknown): Group | null {
  if (isRecord(payload)) {
    const normalizedPayload = normalizeGroupRecord(payload);

    if (normalizedPayload) {
      return normalizedPayload;
    }

    if (isRecord(payload.data)) {
      const normalizedData = normalizeGroupRecord(payload.data);

      if (normalizedData) {
        return normalizedData;
      }
    }

    if (isRecord(payload.group)) {
      const normalizedGroupPayload = normalizeGroupRecord(payload.group);

      if (normalizedGroupPayload) {
        return normalizedGroupPayload;
      }
    }
  }

  return null;
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  const normalizedGroupId = groupId?.trim();

  if (!normalizedGroupId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.GROUP_BY_ID(normalizedGroupId),
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return normalizeGroup(data);
  } catch (error) {
    console.error(`Failed to fetch group with id ${normalizedGroupId}`, error);
    return null;
  }
}
