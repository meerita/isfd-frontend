/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { StadiumActionState } from '@/_types/stadium';
import { buildUpdateStadiumBody } from './payload';

export async function updateStadium(
  _prevState: StadiumActionState,
  formData: FormData,
): Promise<StadiumActionState> {
  const { body, error, stadiumId } = buildUpdateStadiumBody(formData);
  if (error || !body || !stadiumId) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'STADIUM_ID_REQUIRED',
          message: 'Missing stadium identifier.',
          error: 'Stadium identifier is required to update the record.',
        },
      }
    );
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId), body);
    revalidatePath(NAVIGATION.STADIUMS);
    revalidatePath(NAVIGATION.STADIUM_BY_ID(stadiumId));

    return {
      status: 'success',
      stadiumId,
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
