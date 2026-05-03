/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { SeasonActionState } from '@/_types/season';
import { buildUpdateSeasonBody } from './payload';

export async function updateSeason(
  _prevState: SeasonActionState,
  formData: FormData,
): Promise<SeasonActionState> {
  const { body, error, seasonId } = buildUpdateSeasonBody(formData);
  if (error || !seasonId || !body) {
    const result =
      error ?? {
        status: 'error',
        error: {
          reason: 'SEASON_ID_REQUIRED',
          message: 'Missing season identifier.',
          error: 'Season identifier is required to update the record.',
        },
      };
    logCompetitionDebug('season.update', 'validation', { seasonId, body, result });
    return result;
  }

  if (Object.keys(body).length === 0) {
    const result = {
      status: 'success',
      seasonId,
    };
    logCompetitionDebug('season.update', 'skipped', {
      seasonId,
      payload: body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('season.update', 'request', { seasonId, payload: body });

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.SEASON_ADMIN_BY_ID(seasonId),
      body,
    );

    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.SEASON_BY_ID(seasonId));

    const result = {
      status: 'success',
      seasonId,
    };
    logCompetitionDebug('season.update', 'response', {
      seasonId,
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
    logCompetitionDebug('season.update', 'error', { seasonId, payload: body, result });
    return result;
  }
}
