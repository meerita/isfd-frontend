/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { SeasonActionState } from '@/_types/season';
import { mapSeason } from './mappers';
import { buildCreateSeasonBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.season) && typeof payload.season.id === 'string') {
    return payload.season;
  }
  return null;
}

export async function createSeason(
  _prevState: SeasonActionState,
  formData: FormData,
): Promise<SeasonActionState> {
  const { body, error } = buildCreateSeasonBody(formData);
  if (error || !body) {
    const result = error ?? { status: 'error' };
    logCompetitionDebug('season.create', 'validation', { body, result });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('season.create', 'request', body);

  try {
    const { data } = await client.post<unknown>(API_ROUTES.SEASONS_ADMIN, body);
    const raw = extractRaw(data);
    const season = raw ? mapSeason(raw) : null;
    const result = {
      status: 'success' as const,
      seasonId: season?.id,
    };

    logCompetitionDebug('season.create', 'response', { data, season, result });

    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.CREATE_A_SEASON);
    if (season) {
      revalidatePath(NAVIGATION.SEASON_BY_ID(season.id));
    }

    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('season.create', 'error', { payload: body, result });
    return result;
  }
}
