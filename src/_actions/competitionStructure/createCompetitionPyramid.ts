/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionPyramidActionState } from '@/_types/competitionStructure';
import { mapCompetitionPyramid } from './mappers';
import { buildCreateCompetitionPyramidBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_pyramid) &&
    typeof payload.competition_pyramid.id === 'string'
  ) {
    return payload.competition_pyramid;
  }
  return null;
}

export async function createCompetitionPyramid(
  _prevState: CompetitionPyramidActionState,
  formData: FormData,
): Promise<CompetitionPyramidActionState> {
  const { body, error } = buildCreateCompetitionPyramidBody(formData);
  if (error || !body) {
    const result = error ?? { status: 'error' };
    logCompetitionDebug('competitionPyramid.create', 'validation', {
      body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionPyramid.create', 'request', body);

  try {
    const { data } = await client.post<unknown>(
      API_ROUTES.COMPETITION_PYRAMIDS_ADMIN,
      body,
    );
    const raw = extractRaw(data);
    const competitionPyramid = raw ? mapCompetitionPyramid(raw) : null;
    const result = {
      status: 'success' as const,
      competitionPyramidId: competitionPyramid?.id,
    };

    logCompetitionDebug('competitionPyramid.create', 'response', {
      data,
      competitionPyramid,
      result,
    });

    revalidatePath(NAVIGATION.COMPETITION_PYRAMIDS);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_PYRAMID);
    if (competitionPyramid) {
      revalidatePath(NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramid.id));
    }

    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result: CompetitionPyramidActionState = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionPyramid.create', 'error', {
      payload: body,
      result,
    });
    return result;
  }
}
