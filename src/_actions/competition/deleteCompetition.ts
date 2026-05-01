/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
    return {
      success: false,
      reason: 'COMPETITION_ID_REQUIRED',
      error: 'Missing competition identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.COMPETITION_ADMIN_BY_ID(competitionId));
    revalidatePath(NAVIGATION.COMPETITIONS_LIST);
    revalidatePath(NAVIGATION.COMPETITION_BY_ID(competitionId));
    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    return {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
  }
}
