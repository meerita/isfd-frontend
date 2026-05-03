/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteCompetitionResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteCompetition(
  competitionId: string,
): Promise<DeleteCompetitionResult> {
  if (!competitionId) {
    const result = {
      success: false,
      reason: 'COMPETITION_ID_REQUIRED',
      error: 'Missing competition identifier.',
    };
    logCompetitionDebug('competition.delete', 'validation', result);
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competition.delete', 'request', { competitionId });

  try {
    const { data } = await client.delete<unknown>(
      API_ROUTES.COMPETITION_ADMIN_BY_ID(competitionId),
    );
    revalidatePath(NAVIGATION.COMPETITIONS_LIST);
    revalidatePath(NAVIGATION.COMPETITION_BY_ID(competitionId));
    const result = { success: true };
    logCompetitionDebug('competition.delete', 'response', {
      competitionId,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    const result = {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
    logCompetitionDebug('competition.delete', 'error', { competitionId, result });
    return result;
  }
}
