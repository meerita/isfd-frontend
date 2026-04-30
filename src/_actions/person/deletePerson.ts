/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeletePersonResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deletePerson(
  personId: string,
): Promise<DeletePersonResult> {
  if (!personId) {
    return {
      success: false,
      reason: 'PERSON_ID_REQUIRED',
      error: 'Missing person identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[deletePerson] DELETE /admin/persons/:id', { personId });
    }

    await client.delete(API_ROUTES.PERSON_ADMIN_BY_ID(personId));

    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.PERSON_BY_ID(personId));

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
