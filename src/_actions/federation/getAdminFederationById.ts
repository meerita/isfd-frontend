/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationDetailResponse } from '@/_types/federation';
import { mapFederation } from './mappers';

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

export async function getAdminFederationById(
  federationId: string,
): Promise<FederationDetailResponse> {
  if (!federationId) {
    return {
      data: null,
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing federation identifier.',
        error: 'Federation identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid federation response.',
          error: 'The federation detail response was not valid.',
        },
      };
    }

    return { data: mapFederation(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return {
      data: null,
      error: normalized.data,
    };
  }
}
