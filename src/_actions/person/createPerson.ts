/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { PersonActionState } from '@/_types/person';
import { mapPersonAdminDetail } from './mappers';
import { buildCreatePersonBody } from './payload';

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

export async function createPerson(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const { body, error } = buildCreatePersonBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[createPerson] POST /admin/persons payload', body);
    }

    const { data } = await client.post<unknown>(API_ROUTES.PERSONS_ADMIN, body);
    const raw = extractRaw(data);
    const person = raw ? mapPersonAdminDetail(raw) : null;

    if (process.env.NODE_ENV === 'development') {
      console.log('[createPerson] POST /admin/persons response', data);
    }

    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.CREATE_A_PERSON);
    if (person) {
      revalidatePath(NAVIGATION.PERSON_BY_ID(person.id));
    }

    return {
      status: 'success',
      personId: person?.id,
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
