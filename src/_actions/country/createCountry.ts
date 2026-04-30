/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CountryActionState } from '@/_types/country';
import { mapCountry } from './mappers';
import { buildCreateCountryBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.country) && typeof payload.country.id === 'string') return payload.country;
  return null;
}

export async function createCountry(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const { body, error } = buildCreateCountryBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.COUNTRIES_ADMIN, body);
    const raw = extractRaw(data);
    const country = raw ? mapCountry(raw) : null;

    revalidatePath(NAVIGATION.COUNTRIES);
    revalidatePath(NAVIGATION.CREATE_A_COUNTRY);
    if (country) {
      revalidatePath(NAVIGATION.COUNTRY_BY_ID(country.id));
    }

    return {
      status: 'success',
      countryId: country?.id,
    } satisfies CountryActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CountryActionState;
  }
}
