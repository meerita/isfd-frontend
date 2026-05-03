/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
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
    const result =
      error ?? {
        status: 'error' as const,
        error: {
          reason: 'COMPETITION_TYPE_ID_REQUIRED',
          message: 'Missing competition type identifier.',
          error: 'Competition type identifier is required to update the record.',
        },
      };
    logCompetitionDebug('competitionType.update', 'validation', {
      competitionTypeId,
      body,
      result,
    });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result = {
      status: 'success' as const,
      competitionTypeId,
    };
    logCompetitionDebug('competitionType.update', 'skipped', {
      competitionTypeId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionType.update', 'request', {
    competitionTypeId,
    payload: body,
  });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.COMPETITION_TYPE_ADMIN_BY_ID(competitionTypeId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITIONS);
    revalidatePath(NAVIGATION.COMPETITION_TYPE_BY_ID(competitionTypeId));

    const result = {
      status: 'success' as const,
      competitionTypeId,
    };
    logCompetitionDebug('competitionType.update', 'response', {
      competitionTypeId,
      payload: body,
      data,
      result,
    });
    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error' as const,
      error: normalized.data,
    };
    logCompetitionDebug('competitionType.update', 'error', {
      competitionTypeId,
      payload: body,
      result,
    });
    return result;
  }
}
