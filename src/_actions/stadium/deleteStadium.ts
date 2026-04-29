/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteStadiumResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteStadium(
  stadiumId: string,
): Promise<DeleteStadiumResult> {
  if (!stadiumId) {
    return {
      success: false,
      reason: 'STADIUM_ID_REQUIRED',
      error: 'Missing stadium identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId));
    revalidatePath(NAVIGATION.STADIUMS);
    revalidatePath(NAVIGATION.STADIUM_BY_ID(stadiumId));
    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    return {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
  }
}
