/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTypeDetailResponse } from '@/_types/competitionType';
import { mapCompetitionType } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_type) &&
    typeof payload.competition_type.id === 'string'
  ) {
    return payload.competition_type;
  }
  return null;
}

export async function getAdminCompetitionTypeById(
  competitionTypeId: string,
): Promise<CompetitionTypeDetailResponse> {
  if (!competitionTypeId) {
    return {
      data: null,
      error: {
        reason: 'COMPETITION_TYPE_ID_REQUIRED',
        message: 'Missing competition type identifier.',
        error: 'Competition type identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_TYPE_ADMIN_BY_ID(competitionTypeId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid competition type response.',
          error: 'The competition type detail response was not valid.',
        },
      };
    }

    return { data: mapCompetitionType(raw) };
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
