/** @format */

'use server';

// File: src/_actions/country/getCountryById.ts
// Purpose: Fetch a single country by id reusing server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Country } from '@/_types/country';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCountry = (value: unknown): value is Country => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.countryCode === 'string'
  );
};

const normalizeCountry = (payload: unknown): Country | null => {
  if (isCountry(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (isCountry(payload.data)) {
      return payload.data;
    }

    if (isCountry(payload.country)) {
      return payload.country;
    }
  }

  return null;
};

export async function getCountryById(
  countryId: string,
): Promise<Country | null> {
  if (!countryId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.COUNTRY_BY_ID(countryId),
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return normalizeCountry(data);
  } catch (error) {
    console.error(`Failed to fetch country with id ${countryId}`, error);
    return null;
  }
}
