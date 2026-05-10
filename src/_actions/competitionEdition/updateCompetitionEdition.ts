/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionEditionActionState } from '@/_types/competitionEdition';
import { buildUpdateCompetitionEditionBody } from './payload';

export async function updateCompetitionEdition(
  _prevState: CompetitionEditionActionState,
  formData: FormData,
): Promise<CompetitionEditionActionState> {
  const { body, error, competitionEditionId } =
    buildUpdateCompetitionEditionBody(formData);
  if (error || !competitionEditionId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_EDITION_ID_REQUIRED',
          message: 'Missing competition edition identifier.',
          error:
            'Competition edition identifier is required to update the record.',
        },
      };
    logCompetitionDebug('competitionEdition.update', 'validation', {
      competitionEditionId,
      body,
      result,
    });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result: CompetitionEditionActionState = {
      status: 'success',
      competitionEditionId,
    };
    logCompetitionDebug('competitionEdition.update', 'skipped', {
      competitionEditionId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionEdition.update', 'request', {
    competitionEditionId,
    payload: body,
  });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_EDITION_ADMIN_BY_ID(competitionEditionId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_EDITIONS);
    revalidatePath(NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEditionId));

    const result: CompetitionEditionActionState = {
      status: 'success',
      competitionEditionId,
    };
    logCompetitionDebug('competitionEdition.update', 'response', {
      competitionEditionId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result: CompetitionEditionActionState = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionEdition.update', 'error', {
      competitionEditionId,
      payload: body,
      result,
    });
    return result;
  }
}
