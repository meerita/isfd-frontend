/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { ClubDetailResponse } from '@/_types/club';
import { mapClub } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.club) && typeof payload.club.id === 'string') return payload.club;
  return null;
}

export async function getAdminClubById(clubId: string): Promise<ClubDetailResponse> {
  if (!clubId) {
    return {
      data: null,
      error: {
        reason: 'CLUB_ID_REQUIRED',
        message: 'Missing club identifier.',
        error: 'Club identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.CLUB_ADMIN_BY_ID(clubId));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid club response.',
          error: 'The club detail response was not valid.',
        },
      };
    }

    return { data: mapClub(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return {
      data: null,
      error: normalized.data,
    };
  }
}
