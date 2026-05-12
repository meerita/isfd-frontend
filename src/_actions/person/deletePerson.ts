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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractDeleteFunctionalError(payload: unknown): {
  reason: string;
  error?: string;
} | null {
  if (!isRecord(payload)) {
    return null;
  }

  const reason =
    typeof payload.reason === 'string'
      ? payload.reason
      : typeof payload.code === 'string'
        ? payload.code
        : '';

  if (reason !== 'PERSON_HAS_REFERENCES') {
    return null;
  }

  const error =
    typeof payload.error === 'string'
      ? payload.error
      : typeof payload.message === 'string'
        ? payload.message
        : undefined;

  return { reason, error };
}

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

    const { data } = await client.delete<unknown>(API_ROUTES.PERSON_ADMIN_BY_ID(personId));
    const functionalError = extractDeleteFunctionalError(data);

    if (functionalError) {
      return {
        success: false,
        reason: functionalError.reason,
        error: functionalError.error,
      };
    }

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
