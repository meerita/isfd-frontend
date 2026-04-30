/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { CityActionState } from '@/_types/city';
import { mapCity } from './mappers';
import { buildCreateCityBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.city) && typeof payload.city.id === 'string') return payload.city;
  return null;
}

export async function createCity(
  _prevState: CityActionState,
  formData: FormData,
): Promise<CityActionState> {
  const { body, error } = buildCreateCityBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.CITIES_ADMIN, body);
    const raw = extractRaw(data);
    const city = raw ? mapCity(raw) : null;

    revalidatePath(NAVIGATION.CITIES);
    revalidatePath(NAVIGATION.CREATE_A_CITY());
    if (city) {
      revalidatePath(NAVIGATION.CITY_BY_ID(city.id));
      revalidatePath(NAVIGATION.COUNTRY_BY_ID(city.countryId));
    }

    return {
      status: 'success',
      cityId: city?.id,
    } satisfies CityActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CityActionState;
  }
}
