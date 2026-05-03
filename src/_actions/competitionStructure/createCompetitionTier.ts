/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
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
  if (error || !body) {
    const result = error ?? { status: 'error' };
    logCompetitionDebug('competitionTier.create', 'validation', { body, result });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionTier.create', 'request', body);

  try {
    const { data } = await client.post<unknown>(API_ROUTES.COMPETITION_TIERS_ADMIN, body);
    const raw = extractRaw(data);
    const competitionTier = raw ? mapCompetitionTier(raw) : null;
    const result = {
      status: 'success' as const,
      competitionTierId: competitionTier?.id,
    };

    logCompetitionDebug('competitionTier.create', 'response', {
      data,
      competitionTier,
      result,
    });

    revalidatePath(NAVIGATION.COMPETITION_TIERS);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_TIER);
    if (competitionTier) {
      revalidatePath(NAVIGATION.COMPETITION_TIER_BY_ID(competitionTier.id));
    }

    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionTier.create', 'error', {
      payload: body,
      result,
    });
    return result;
  }
}
