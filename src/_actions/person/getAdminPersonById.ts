/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { PersonDetailResponse } from '@/_types/person';
import { mapPerson } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') {
    return payload.data;
  }
  if (isRecord(payload.person) && typeof payload.person.id === 'string') {
    return payload.person;
  }

  return null;
}

export async function getAdminPersonById(
  personId: string,
): Promise<PersonDetailResponse> {
  if (!personId) {
    return {
      data: null,
      error: {
        reason: 'PERSON_ID_REQUIRED',
        message: 'Missing person identifier.',
        error: 'Person identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.PERSON_ADMIN_BY_ID(personId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid person response.',
          error: 'The person detail response was not valid.',
        },
      };
    }

    return { data: mapPerson(raw) };
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
