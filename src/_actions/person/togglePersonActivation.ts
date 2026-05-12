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
    error: 'Person identifier is required to toggle activation.',
  },
};

export async function togglePersonActivation(
  _prevState: PersonActionState,
  formData: FormData,
): Promise<PersonActionState> {
  const personId = (formData.get('person_id') as string | null)?.trim() ?? '';
  if (!personId) {
    return MISSING_ID_RESPONSE;
  }

  const rawIsPublic = formData.get('is_public');
  const is_public =
    typeof rawIsPublic === 'string'
      ? rawIsPublic.toLowerCase() === 'true'
      : false;

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.PERSON_ADMIN_BY_ID(personId), { is_public });
    revalidatePath(NAVIGATION.PERSONS);
    revalidatePath(NAVIGATION.PERSON_BY_ID(personId));
    return { status: 'success', personId } satisfies PersonActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies PersonActionState;
  }
}
