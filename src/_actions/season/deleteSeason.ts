/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteSeasonResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteSeason(seasonId: string): Promise<DeleteSeasonResult> {
  if (!seasonId) {
    return {
      success: false,
      reason: 'SEASON_ID_REQUIRED',
      error: 'Missing season identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.SEASON_ADMIN_BY_ID(seasonId));
    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.SEASON_BY_ID(seasonId));
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
