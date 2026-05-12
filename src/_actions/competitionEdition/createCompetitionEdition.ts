/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CompetitionEditionActionState } from '@/_types/competitionEdition';
import { mapCompetitionEdition } from './mappers';
import { buildCreateCompetitionEditionBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.competition_edition) &&
    typeof payload.competition_edition.id === 'string'
  ) {
    return payload.competition_edition;
  }
  return null;
}

export async function createCompetitionEdition(
  _prevState: CompetitionEditionActionState,
  formData: FormData,
): Promise<CompetitionEditionActionState> {
  const { body, error } = buildCreateCompetitionEditionBody(formData);
  if (error || !body) {
    const result = error ?? { status: 'error' };
    logCompetitionDebug('competitionEdition.create', 'validation', {
      body,
      result,
    });
    return result;
  }

  const client = await getServerAxios();
  logCompetitionDebug('competitionEdition.create', 'request', body);

  try {
    const { data } = await client.post<unknown>(
      API_ROUTES.COMPETITION_EDITIONS_ADMIN,
      body,
    );
    const raw = extractRaw(data);
    const competitionEdition = raw ? mapCompetitionEdition(raw) : null;
    const result = {
      status: 'success' as const,
      competitionEditionId: competitionEdition?.id,
    };

    logCompetitionDebug('competitionEdition.create', 'response', {
      data,
      competitionEdition,
      result,
    });

    revalidatePath(NAVIGATION.COMPETITION_EDITIONS);
    revalidatePath(NAVIGATION.CREATE_A_COMPETITION_EDITION);
    if (competitionEdition) {
      revalidatePath(NAVIGATION.COMPETITION_EDITION_BY_ID(competitionEdition.id));
    }

    return result;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    const result: CompetitionEditionActionState = {
      status: 'error',
      error: normalized.data,
    };
    logCompetitionDebug('competitionEdition.create', 'error', {
      payload: body,
      result,
    });
    return result;
  }
}
