/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
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
    const result = {
      success: false,
      reason: 'COMPETITION_TYPE_ID_REQUIRED',
      error: 'Missing competition type identifier.',
    };
    logCompetitionDebug('competitionType.delete', 'validation', result);
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionType.delete', 'request', { competitionTypeId });

  try {
    const { data } = await client.delete<unknown>(
      API_ROUTES.COMPETITION_TYPE_ADMIN_BY_ID(competitionTypeId),
    );
    revalidatePath(NAVIGATION.COMPETITIONS);
    revalidatePath(NAVIGATION.COMPETITION_TYPE_BY_ID(competitionTypeId));
    const result = { success: true };
    logCompetitionDebug('competitionType.delete', 'response', {
      competitionTypeId,
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
    logCompetitionDebug('competitionType.delete', 'error', {
      competitionTypeId,
      result,
    });
    return result;
  }
}
