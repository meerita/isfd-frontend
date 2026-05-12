/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { CompetitionPyramidDeleteActionState } from '@/_types/competitionStructure';
import { deleteCompetitionPyramidRequest } from './deleteCompetitionPyramidRequest';

export async function deleteCompetitionPyramidAction(
  competitionPyramidId: string,
): Promise<CompetitionPyramidDeleteActionState> {
  if (!competitionPyramidId) {
    const result: CompetitionPyramidDeleteActionState = {
      status: 'error',
      error: {
        reason: 'COMPETITION_PYRAMID_ID_REQUIRED',
        message: 'Missing competition pyramid identifier.',
        error: 'Competition pyramid identifier is required.',
      },
    };
    logCompetitionDebug('competitionPyramid.delete', 'validation', result);
    return result;
  }

  logCompetitionDebug('competitionPyramid.delete', 'request', {
    competitionPyramidId,
  });

  try {
    await deleteCompetitionPyramidRequest(competitionPyramidId);

    revalidatePath(NAVIGATION.COMPETITION_PYRAMIDS);
    revalidatePath(NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramidId));

    const result: CompetitionPyramidDeleteActionState = {
      status: 'success',
      competitionPyramidId,
    };
    logCompetitionDebug('competitionPyramid.delete', 'response', result);
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    const result: CompetitionPyramidDeleteActionState = {
      status: 'error',
      error: normalized.data,
      competitionPyramidId,
    };
    logCompetitionDebug('competitionPyramid.delete', 'error', result);
    return result;
  }
}
