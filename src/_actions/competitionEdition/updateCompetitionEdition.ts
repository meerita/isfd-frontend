/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_EDITION_ID_REQUIRED',
          message: 'Missing competition edition identifier.',
          error:
            'Competition edition identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      competitionEditionId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(
      API_ROUTES.COMPETITION_EDITION_ADMIN_BY_ID(competitionEditionId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_EDITIONS);
    revalidatePath(NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEditionId));

    return {
      status: 'success',
      competitionEditionId,
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
