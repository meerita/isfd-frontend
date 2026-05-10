/** @format */

'use server';

// File: src/_actions/city/toggleCityActivation.ts
// Purpose: Toggle activation status of a city via the admin API
// Author: Diego M. Lafuente

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CityActionState } from '@/_types/city';

const MISSING_ID_RESPONSE: CityActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing city identifier.',
    error: 'City identifier is required to toggle activation.',
  },
};

export async function toggleCityActivation(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const cityId = (formData.get('cityId') as string | null)?.trim() ?? '';
  if (!cityId) return MISSING_ID_RESPONSE;

  const rawIsActive = formData.get('isActive');
  const is_public =
    typeof rawIsActive === 'string'
      ? rawIsActive.toLowerCase() === 'true'
      : false;

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.CITY_ADMIN_ACTIVATION(cityId), { is_public });
    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CITY_BY_ID(cityId));
    return { status: 'success' } satisfies CityActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CityActionState;
  }
}
