/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionTypeActionState } from '@/_types/competitionType';
import { mapCompetitionType } from './mappers';
import { buildCreateCompetitionTypeBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_type) &&
    typeof payload.competition_type.id === 'string'
  ) {
    return payload.competition_type;
  }
  return null;
}

export async function createCompetitionType(
  _prevState: CompetitionTypeActionState,
  formData: FormData,
): Promise<CompetitionTypeActionState> {
  const { body, error } = buildCreateCompetitionTypeBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(
      API_ROUTES.COMPETITION_TYPES_ADMIN,
      body,
    );
    const raw = extractRaw(data);
    const competitionType = raw ? mapCompetitionType(raw) : null;

    revalidatePath(NAVIGATION.COMPETITION_TYPES);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_TYPE);
    if (competitionType) {
      revalidatePath(NAVIGATION.COMPETITION_TYPE_BY_ID(competitionType.id));
    }

    return {
      status: 'success',
      competitionTypeId: competitionType?.id,
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
