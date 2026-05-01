/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionActionState } from '@/_types/competition';
import { buildUpdateCompetitionBody } from './payload';

export async function updateCompetition(
  _prevState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const { body, error, competitionId } = buildUpdateCompetitionBody(formData);
  if (error || !competitionId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_ID_REQUIRED',
          message: 'Missing competition identifier.',
          error: 'Competition identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      competitionId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.COMPETITION_ADMIN_BY_ID(competitionId), body);

    revalidatePath(NAVIGATION.COMPETITIONS_LIST);
    revalidatePath(NAVIGATION.COMPETITION_BY_ID(competitionId));

    return {
      status: 'success',
      competitionId,
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
