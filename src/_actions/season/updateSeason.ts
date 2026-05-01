/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'SEASON_ID_REQUIRED',
          message: 'Missing season identifier.',
          error: 'Season identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      seasonId,
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.SEASON_ADMIN_BY_ID(seasonId), body);

    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.SEASON_BY_ID(seasonId));

    return {
      status: 'success',
      seasonId,
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
