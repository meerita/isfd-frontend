/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { ClubActionState } from '@/_types/club';
import { mapClub } from './mappers';
import { buildUpdateClubBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.club) && typeof payload.club.id === 'string') return payload.club;
  return null;
}

export async function updateClub(
  _prevState: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const { body, error, clubId } = buildUpdateClubBody(formData);
  if (error || !clubId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'CLUB_ID_REQUIRED',
          message: 'Missing club identifier.',
          error: 'Club identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      clubId,
    } satisfies ClubActionState;
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.CLUB_ADMIN_BY_ID(clubId),
      body,
    );
    const raw = extractRaw(data);
    const club = raw ? mapClub(raw) : null;

    revalidatePath(NAVIGATION.CLUBS);
    revalidatePath(NAVIGATION.CLUB_BY_ID(clubId));
    if (club) {
      revalidatePath(NAVIGATION.CLUB_BY_SLUG(club.slug));
    }

    return {
      status: 'success',
      clubId,
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
