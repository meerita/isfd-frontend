/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTierDetailResponse } from '@/_types/competitionStructure';
import { mapCompetitionTier } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.competition_tier) && typeof payload.competition_tier.id === 'string') {
    return payload.competition_tier;
  }
  return null;
}

export async function getAdminCompetitionTierById(
  competitionTierId: string,
): Promise<CompetitionTierDetailResponse> {
  if (!competitionTierId) {
    return {
      data: null,
      error: {
        reason: 'COMPETITION_TIER_ID_REQUIRED',
        message: 'Missing competition tier identifier.',
        error: 'Competition tier identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_TIER_ADMIN_BY_ID(competitionTierId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid competition tier response.',
          error: 'The competition tier detail response was not valid.',
        },
      };
    }

    return { data: mapCompetitionTier(raw) };
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
