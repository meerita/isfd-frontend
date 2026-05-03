/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTierActionState } from '@/_types/competitionStructure';
import { buildUpdateCompetitionTierBody } from './payload';

export async function updateCompetitionTier(
  _prevState: CompetitionTierActionState,
  formData: FormData,
): Promise<CompetitionTierActionState> {
  const { body, error, competitionTierId } = buildUpdateCompetitionTierBody(formData);
  if (error || !competitionTierId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_TIER_ID_REQUIRED',
          message: 'Missing competition tier identifier.',
          error: 'Competition tier identifier is required to update the record.',
        },
      };
    logCompetitionDebug('competitionTier.update', 'validation', {
      competitionTierId,
      body,
      result,
    });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result = {
      status: 'success',
      competitionTierId,
    };
    logCompetitionDebug('competitionTier.update', 'skipped', {
      competitionTierId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionTier.update', 'request', {
    competitionTierId,
    payload: body,
  });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_TIER_ADMIN_BY_ID(competitionTierId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_TIERS);
    revalidatePath(NAVIGATION.COMPETITION_TIER_BY_ID(competitionTierId));

    const result = {
      status: 'success',
      competitionTierId,
    };
    logCompetitionDebug('competitionTier.update', 'response', {
      competitionTierId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionTier.update', 'error', {
      competitionTierId,
      payload: body,
      result,
    });
    return result;
  }
}
