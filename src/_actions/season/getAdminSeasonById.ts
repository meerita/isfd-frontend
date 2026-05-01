/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { SeasonDetailResponse } from '@/_types/season';
import { mapSeason } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.season) && typeof payload.season.id === 'string') {
    return payload.season;
  }
  return null;
}

export async function getAdminSeasonById(
  seasonId: string,
): Promise<SeasonDetailResponse> {
  if (!seasonId) {
    return {
      data: null,
      error: {
        reason: 'SEASON_ID_REQUIRED',
        message: 'Missing season identifier.',
        error: 'Season identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.SEASON_ADMIN_BY_ID(seasonId));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid season response.',
          error: 'The season detail response was not valid.',
        },
      };
    }

    return { data: mapSeason(raw) };
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
