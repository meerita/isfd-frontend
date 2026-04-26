/** @format */

'use server';

// File: src/_actions/country/createCountry.ts
// Purpose: Create a country via the admin API
// Author: Diego M. Lafuente

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CountryActionState } from '@/_types/country';

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export async function createCountry(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const name = str(formData, 'name');

  const body = { name };

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.post(API_ROUTES.COUNTRIES_ADMIN, body, { headers });
    revalidatePath(NAVIGATION.COUNTRIES);
    return { status: 'success' } satisfies CountryActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CountryActionState;
  }
}
