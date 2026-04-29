/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { ClubActionState } from '@/_types/club';
import { mapClub } from './mappers';
import { buildCreateClubBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.club) && typeof payload.club.id === 'string') return payload.club;
  return null;
}

export async function createClub(
  _prevState: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const { body, error } = buildCreateClubBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    console.log('[createClub] POST /admin/clubs payload', body);
    const { data } = await client.post<unknown>(API_ROUTES.CLUBS_ADMIN, body);
    const raw = extractRaw(data);
    const club = raw ? mapClub(raw) : null;

    revalidatePath(NAVIGATION.CLUBS);
    revalidatePath(NAVIGATION.CREATE_A_CLUB);
    if (club) {
      revalidatePath(NAVIGATION.CLUB_BY_ID(club.id));
      revalidatePath(NAVIGATION.CLUB_BY_SLUG(club.slug));
    }

    return {
      status: 'success',
      clubId: club?.id,
    } satisfies ClubActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies ClubActionState;
  }
}
