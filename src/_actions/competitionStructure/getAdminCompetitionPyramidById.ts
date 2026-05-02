/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionPyramidDetailResponse } from '@/_types/competitionStructure';
import { mapCompetitionPyramid } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_pyramid) &&
    typeof payload.competition_pyramid.id === 'string'
  ) {
    return payload.competition_pyramid;
  }
  return null;
}

export async function getAdminCompetitionPyramidById(
  competitionPyramidId: string,
): Promise<CompetitionPyramidDetailResponse> {
  if (!competitionPyramidId) {
    return {
      data: null,
      error: {
        reason: 'COMPETITION_PYRAMID_ID_REQUIRED',
        message: 'Missing competition pyramid identifier.',
        error: 'Competition pyramid identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_PYRAMID_ADMIN_BY_ID(competitionPyramidId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid competition pyramid response.',
          error: 'The competition pyramid detail response was not valid.',
        },
      };
    }

    return { data: mapCompetitionPyramid(raw) };
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
