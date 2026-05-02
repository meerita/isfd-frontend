/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
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
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(
      API_ROUTES.COMPETITION_PYRAMIDS_ADMIN,
      body,
    );
    const raw = extractRaw(data);
    const competitionPyramid = raw ? mapCompetitionPyramid(raw) : null;

    revalidatePath(NAVIGATION.COMPETITION_PYRAMIDS);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_PYRAMID);
    if (competitionPyramid) {
      revalidatePath(NAVIGATION.COMPETITION_PYRAMID_BY_ID(competitionPyramid.id));
    }

    return {
      status: 'success',
      competitionPyramidId: competitionPyramid?.id,
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
