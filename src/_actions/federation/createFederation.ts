/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationActionState } from '@/_types/federation';
import { mapFederation } from './mappers';
import { buildCreateFederationBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.federation) &&
    typeof payload.federation.id === 'string'
  ) {
    return payload.federation;
  }

  return null;
}

export async function createFederation(
  _prevState: FederationActionState,
  formData: FormData,
): Promise<FederationActionState> {
  const { body, error } = buildCreateFederationBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.FEDERATIONS_ADMIN, body);
    const raw = extractRaw(data);
    const federationId = raw ? mapFederation(raw).id : undefined;

    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.CREATE_A_FEDERATION);
    if (federationId) {
      revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));
    }

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
