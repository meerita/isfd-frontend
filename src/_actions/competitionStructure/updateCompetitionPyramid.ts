/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_PYRAMID_ID_REQUIRED',
          message: 'Missing competition pyramid identifier.',
          error: 'Competition pyramid identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      competitionPyramidId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(
      API_ROUTES.COMPETITION_PYRAMID_ADMIN_BY_ID(competitionPyramidId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_PYRAMIDS);
    revalidatePath(NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramidId));

    return {
      status: 'success',
      competitionPyramidId,
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
