/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteSeasonResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteSeason(seasonId: string): Promise<DeleteSeasonResult> {
  if (!seasonId) {
    const result = {
      success: false,
      reason: 'SEASON_ID_REQUIRED',
      error: 'Missing season identifier.',
    };
    logCompetitionDebug('season.delete', 'validation', result);
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('season.delete', 'request', { seasonId });

  try {
    const { data } = await client.delete<unknown>(API_ROUTES.SEASON_ADMIN_BY_ID(seasonId));
    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.SEASON_BY_ID(seasonId));
    const result = { success: true };
    logCompetitionDebug('season.delete', 'response', { seasonId, data, result });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    const result = {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
    logCompetitionDebug('season.delete', 'error', { seasonId, result });
    return result;
  }
}
