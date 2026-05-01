/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.SEASONS_ADMIN, body);
    const raw = extractRaw(data);
    const season = raw ? mapSeason(raw) : null;

    revalidatePath(NAVIGATION.COMPETITION_SEASONS);
    revalidatePath(NAVIGATION.CREATE_A_SEASON);
    if (season) {
      revalidatePath(NAVIGATION.SEASON_BY_ID(season.id));
    }

    return {
      status: 'success',
      seasonId: season?.id,
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
