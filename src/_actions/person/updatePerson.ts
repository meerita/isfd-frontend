/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { PersonActionState } from '@/_types/person';
import { buildUpdatePersonBody } from './payload';

export async function updatePerson(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const { body, error, personId } = buildUpdatePersonBody(formData);
  if (error || !personId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'PERSON_ID_REQUIRED',
          message: 'Missing person identifier.',
          error: 'Person identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      personId,
    } satisfies PersonActionState;
  }

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[updatePerson] PATCH /admin/persons/:id payload', {
        personId,
        body,
      });
    }

    const { data } = await client.patch<unknown>(
      API_ROUTES.PERSON_ADMIN_BY_ID(personId),
      body,
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[updatePerson] PATCH /admin/persons/:id response', data);
    }

    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.PERSON_BY_ID(personId));

    return {
      status: 'success',
      personId,
    } satisfies PersonActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies PersonActionState;
  }
}
