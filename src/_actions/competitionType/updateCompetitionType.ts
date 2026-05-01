/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTypeActionState } from '@/_types/competitionType';
import { buildUpdateCompetitionTypeBody } from './payload';

export async function updateCompetitionType(
  _prevState: CompetitionTypeActionState,
  formData: FormData,
): Promise<CompetitionTypeActionState> {
  const { body, error, competitionTypeId } =
    buildUpdateCompetitionTypeBody(formData);
  if (error || !competitionTypeId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'COMPETITION_TYPE_ID_REQUIRED',
          message: 'Missing competition type identifier.',
          error: 'Competition type identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      competitionTypeId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(
      API_ROUTES.COMPETITION_TYPE_ADMIN_BY_ID(competitionTypeId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_TYPES);
    revalidatePath(NAVIGATION.COMPETITION_TYPE_BY_ID(competitionTypeId));

    return {
      status: 'success',
      competitionTypeId,
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
