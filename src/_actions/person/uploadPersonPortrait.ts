/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
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

  const client = await getServerAxios();

  try {
    await client.post(API_ROUTES.PERSON_ADMIN_PORTRAIT(personId), payload);
    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.PERSON_BY_ID(personId));

    return { status: 'success', personId } satisfies PersonActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies PersonActionState;
  }
}
