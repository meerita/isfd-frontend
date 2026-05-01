/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionEditionDetailResponse } from '@/_types/competitionEdition';
import { mapCompetitionEdition } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_edition) &&
    typeof payload.competition_edition.id === 'string'
  ) {
    return payload.competition_edition;
  }
  return null;
}

export async function getAdminCompetitionEditionById(
  competitionEditionId: string,
): Promise<CompetitionEditionDetailResponse> {
  if (!competitionEditionId) {
    return {
      data: null,
      error: {
        reason: 'COMPETITION_EDITION_ID_REQUIRED',
        message: 'Missing competition edition identifier.',
        error: 'Competition edition identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_EDITION_ADMIN_BY_ID(competitionEditionId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid competition edition response.',
          error: 'The competition edition detail response was not valid.',
        },
      };
    }

    return { data: mapCompetitionEdition(raw) };
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
