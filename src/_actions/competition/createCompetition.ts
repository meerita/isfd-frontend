/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionActionState } from '@/_types/competition';
import { mapCompetition } from './mappers';
import { buildCreateCompetitionBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.competition) && typeof payload.competition.id === 'string') {
    return payload.competition;
  }
  return null;
}

export async function createCompetition(
  _prevState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const { body, error } = buildCreateCompetitionBody(formData);
  if (error || !body) {
    const result = error ?? { status: 'error' };
    logCompetitionDebug('competition.create', 'validation', { body, result });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competition.create', 'request', body);

  try {
    const { data } = await client.post<unknown>(API_ROUTES.COMPETITIONS_ADMIN, body);
    const raw = extractRaw(data);
    const competition = raw ? mapCompetition(raw) : null;
    const result = {
      status: 'success' as const,
      competitionId: competition?.id,
    };

    logCompetitionDebug('competition.create', 'response', {
      data,
      competition,
      result,
    });

    revalidatePath(NAVIGATION.COMPETITIONS_LIST);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION);
    if (competition) {
      revalidatePath(NAVIGATION.COMPETITION_BY_ID(competition.id));
    }

    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competition.create', 'error', { payload: body, result });
    return result;
  }
}
