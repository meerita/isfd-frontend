/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteFederationResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteFederation(
  federationId: string,
): Promise<DeleteFederationResult> {
  if (!federationId) {
    return {
      success: false,
      reason: 'FORM_VALIDATION_ERROR',
      error: 'Missing federation identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId));
    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));
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
