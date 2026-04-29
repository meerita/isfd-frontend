/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteClubResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteClub(
  clubId: string,
  clubSlug?: string | null,
): Promise<DeleteClubResult> {
  if (!clubId) {
    return {
      success: false,
      reason: 'CLUB_ID_REQUIRED',
      error: 'Missing club identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.CLUB_ADMIN_BY_ID(clubId));
    revalidatePath(NAVIGATION.CLUBS);
    revalidatePath(NAVIGATION.CLUB_BY_ID(clubId));
    if (clubSlug) {
      revalidatePath(NAVIGATION.CLUB_BY_SLUG(clubSlug));
    }
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
