/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionActionState } from '@/_types/competition';
import { mapCompetition } from './mappers';
import { buildUpdateCompetitionBody } from './payload';

export async function updateCompetition(
  _prevState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const { body, error, competitionId } = buildUpdateCompetitionBody(formData);
  if (error || !competitionId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_ID_REQUIRED',
          message: 'Missing competition identifier.',
          error: 'Competition identifier is required to update the record.',
        },
      };
    logCompetitionDebug('competition.update', 'validation', {
      competitionId,
      body,
      result,
    });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result: CompetitionActionState = {
      status: 'success',
      competitionId,
    };
    logCompetitionDebug('competition.update', 'skipped', {
      competitionId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competition.update', 'request', { competitionId, payload: body });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_ADMIN_BY_ID(competitionId),
      body,
    );
    const competition =
      typeof data === 'object' && data !== null
        ? mapCompetition(data as Record<string, unknown>)
        : null;

    revalidatePath(NAVIGATION.COMPETITIONS_LIST);
    revalidatePath(NAVIGATION.COMPETITION_BY_ID(competitionId));

    const result: CompetitionActionState = {
      status: 'success',
      competitionId,
      competitionSlug: competition?.slug,
    };
    logCompetitionDebug('competition.update', 'response', {
      competitionId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result: CompetitionActionState = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competition.update', 'error', {
      competitionId,
      payload: body,
      result,
    });
    return result;
  }
}
