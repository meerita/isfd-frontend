/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { StadiumDetailResponse } from '@/_types/stadium';
import { mapStadium } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (
    isRecord(payload.data) &&
    typeof (payload.data as Record<string, unknown>).id === 'string'
  ) {
    return payload.data as Record<string, unknown>;
  }
  if (
    isRecord(payload.stadium) &&
    typeof (payload.stadium as Record<string, unknown>).id === 'string'
  ) {
    return payload.stadium as Record<string, unknown>;
  }
  return null;
}

export async function getAdminStadiumById(
  stadiumId: string,
): Promise<StadiumDetailResponse> {
  if (!stadiumId) {
    return {
      data: null,
      error: {
        reason: 'STADIUM_ID_REQUIRED',
        message: 'Missing stadium identifier.',
        error: 'Stadium identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid stadium response.',
          error: 'The stadium detail response was not valid.',
        },
      };
    }

    return { data: mapStadium(raw) };
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
