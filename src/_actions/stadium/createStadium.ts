/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { StadiumActionState } from '@/_types/stadium';
import { mapStadium } from './mappers';
import { buildCreateStadiumBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (
    isRecord(payload.data) &&
    typeof (payload.data as Record<string, unknown>).id === 'string'
  ) {
    return payload.data as Record<string, unknown>;
  }
  if (
    isRecord(payload.stadium) &&
    typeof (payload.stadium as Record<string, unknown>).id === 'string'
  ) {
    return payload.stadium as Record<string, unknown>;
  }
  return null;
}

export async function createStadium(
  _prevState: StadiumActionState,
  formData: FormData,
): Promise<StadiumActionState> {
  const { body, error } = buildCreateStadiumBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.STADIUMS_ADMIN, body);
    const raw = extractRaw(data);
    const stadium = raw ? mapStadium(raw) : null;

    revalidatePath(NAVIGATION.STADIUMS);
    revalidatePath(NAVIGATION.CREATE_A_STADIUM);
    if (stadium) {
      revalidatePath(NAVIGATION.STADIUM_BY_ID(stadium.id));
    }

    return {
      status: 'success',
      stadiumId: stadium?.id,
    } satisfies StadiumActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies StadiumActionState;
  }
}
