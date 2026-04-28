/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationActionState } from '@/_types/federation';
import { buildUpdateFederationBody } from './payload';

export async function updateFederation(
  _prevState: FederationActionState,
  formData: FormData,
): Promise<FederationActionState> {
  const { body, error, federationId } = buildUpdateFederationBody(formData);
  if (error || !body || !federationId) {
    return error ?? {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing federation identifier.',
        error: 'Federation identifier is required to update the record.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId), body);
    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));

    return {
      status: 'success',
      federationId,
    } satisfies FederationActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies FederationActionState;
  }
}
