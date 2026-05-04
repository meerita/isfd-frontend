/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionPyramidActionState } from '@/_types/competitionStructure';
import { buildUpdateCompetitionPyramidBody } from './payload';

export async function updateCompetitionPyramid(
  _prevState: CompetitionPyramidActionState,
  formData: FormData,
): Promise<CompetitionPyramidActionState> {
  const { body, error, competitionPyramidId } =
    buildUpdateCompetitionPyramidBody(formData);
  if (error || !competitionPyramidId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_PYRAMID_ID_REQUIRED',
          message: 'Missing competition pyramid identifier.',
          error: 'Competition pyramid identifier is required to update the record.',
        },
      };
    logCompetitionDebug('competitionPyramid.update', 'validation', {
      competitionPyramidId,
      body,
      result,
    });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result: CompetitionPyramidActionState = {
      status: 'success',
      competitionPyramidId,
    };
    logCompetitionDebug('competitionPyramid.update', 'skipped', {
      competitionPyramidId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionPyramid.update', 'request', {
    competitionPyramidId,
    payload: body,
  });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_PYRAMID_ADMIN_BY_ID(competitionPyramidId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_PYRAMIDS);
    revalidatePath(NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramidId));

    const result: CompetitionPyramidActionState = {
      status: 'success',
      competitionPyramidId,
    };
    logCompetitionDebug('competitionPyramid.update', 'response', {
      competitionPyramidId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result: CompetitionPyramidActionState = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionPyramid.update', 'error', {
      competitionPyramidId,
      payload: body,
      result,
    });
    return result;
  }
}
