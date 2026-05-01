/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionDetailResponse } from '@/_types/competition';
import { mapCompetition } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.competition) && typeof payload.competition.id === 'string') {
    return payload.competition;
  }
  return null;
}

export async function getAdminCompetitionById(
  competitionId: string,
): Promise<CompetitionDetailResponse> {
  if (!competitionId) {
    return {
      data: null,
      error: {
        reason: 'COMPETITION_ID_REQUIRED',
        message: 'Missing competition identifier.',
        error: 'Competition identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_ADMIN_BY_ID(competitionId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid competition response.',
          error: 'The competition detail response was not valid.',
        },
      };
    }

    return { data: mapCompetition(raw) };
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
