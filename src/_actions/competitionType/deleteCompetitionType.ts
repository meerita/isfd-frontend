/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteCompetitionTypeResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteCompetitionType(
  competitionTypeId: string,
): Promise<DeleteCompetitionTypeResult> {
  if (!competitionTypeId) {
    return {
      success: false,
      reason: 'COMPETITION_TYPE_ID_REQUIRED',
      error: 'Missing competition type identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.COMPETITION_TYPE_ADMIN_BY_ID(competitionTypeId));
    revalidatePath(NAVIGATION.COMPETITION_TYPES);
    revalidatePath(NAVIGATION.COMPETITION_TYPE_BY_ID(competitionTypeId));
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
