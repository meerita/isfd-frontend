/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTierActionState } from '@/_types/competitionStructure';
import { mapCompetitionTier } from './mappers';
import { buildCreateCompetitionTierBody } from './payload';

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

export async function createCompetitionTier(
  _prevState: CompetitionTierActionState,
  formData: FormData,
): Promise<CompetitionTierActionState> {
  const { body, error } = buildCreateCompetitionTierBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.COMPETITION_TIERS_ADMIN, body);
    const raw = extractRaw(data);
    const competitionTier = raw ? mapCompetitionTier(raw) : null;

    revalidatePath(NAVIGATION.COMPETITION_TIERS);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_TIER);
    if (competitionTier) {
      revalidatePath(NAVIGATION.COMPETITION_TIER_BY_ID(competitionTier.id));
    }

    return {
      status: 'success',
      competitionTierId: competitionTier?.id,
    };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    };
  }
}
