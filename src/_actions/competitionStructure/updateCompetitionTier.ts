/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_TIER_ID_REQUIRED',
          message: 'Missing competition tier identifier.',
          error: 'Competition tier identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      competitionTierId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.COMPETITION_TIER_ADMIN_BY_ID(competitionTierId), body);

    revalidatePath(NAVIGATION.COMPETITION_TIERS);
    revalidatePath(NAVIGATION.COMPETITION_TIER_BY_ID(competitionTierId));

    return {
      status: 'success',
      competitionTierId,
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
