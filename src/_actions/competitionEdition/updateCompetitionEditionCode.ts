/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionEditionActionState } from '@/_types/competitionEdition';
import { buildUpdateCompetitionEditionCodeBody } from './payload';

export async function updateCompetitionEditionCode(
  _prevState: CompetitionEditionActionState,
  formData: FormData,
): Promise<CompetitionEditionActionState> {
  const { body, error, competitionEditionId } =
    buildUpdateCompetitionEditionCodeBody(formData);
  if (error || !competitionEditionId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_EDITION_ID_REQUIRED',
          message: 'Missing competition edition identifier.',
          error:
            'Competition edition identifier is required to update the code.',
        },
      };
    logCompetitionDebug('competitionEdition.updateCode', 'validation', {
      competitionEditionId,
      body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionEdition.updateCode', 'request', {
    competitionEditionId,
    payload: body,
  });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_EDITION_CODE_ADMIN_BY_ID(competitionEditionId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_EDITIONS);
    revalidatePath(NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEditionId));

    const result = {
      status: 'success',
      competitionEditionId,
    };
    logCompetitionDebug('competitionEdition.updateCode', 'response', {
      competitionEditionId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionEdition.updateCode', 'error', {
      competitionEditionId,
      payload: body,
      result,
    });
    return result;
  }
}
