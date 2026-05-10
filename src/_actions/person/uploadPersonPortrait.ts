/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import ENV from '@/_constants/env';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import type { PersonActionState } from '@/_types/person';

const MISSING_ID_RESPONSE: PersonActionState = {
  status: 'error',
  error: {
    reason: 'PERSON_ID_REQUIRED',
    message: 'Missing person identifier.',
    error: 'Person identifier is required to upload the portrait.',
  },
};

const MISSING_FILE_RESPONSE: PersonActionState = {
  status: 'error',
  error: {
    reason: 'INVALID_REQUEST',
    message: 'request is invalid',
    error: 'A portrait file is required.',
  },
};

export async function uploadPersonPortrait(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const personId = (formData.get('person_id') as string | null)?.trim() ?? '';
  if (!personId) {
    return MISSING_ID_RESPONSE;
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return MISSING_FILE_RESPONSE;
  }

  const payload = new FormData();
  payload.append('file', file, file.name);
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const response = await fetch(
      `${ENV.apiBaseUrl}${API_ROUTES.PERSON_ADMIN_PORTRAIT(personId)}`,
      {
        method: 'POST',
        headers,
        body: payload,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | {
            code?: string;
            reason?: string;
            message?: string;
            error?: string;
            details?: string;
          }
        | null;

      return {
        status: 'error',
        error: {
          reason: payload?.reason ?? payload?.code ?? 'API_ERROR',
          message: payload?.message ?? payload?.error ?? 'Unexpected error',
          error:
            payload?.error ??
            payload?.details ??
            payload?.message ??
            'Unexpected error',
          statusCode: response.status,
        },
      } satisfies PersonActionState;
    }

    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.PERSON_BY_ID(personId));

    return { status: 'success', personId } satisfies PersonActionState;
  } catch (error) {
    return {
      status: 'error',
      error: {
        reason: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unexpected error',
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
    } satisfies PersonActionState;
  }
}
