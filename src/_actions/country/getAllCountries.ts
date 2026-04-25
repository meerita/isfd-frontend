/** @format */

'use server';

// File: src/_actions/country/getAllCountries.ts
// Purpose: Fetch full countries catalog (including inactive) for dependent forms
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { extractCountries } from '@/_helpers/extractCountries';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Country } from '@/_types/country';

export async function getAllCountries(): Promise<ReadonlyArray<Country>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.COUNTRIES_ALL, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return extractCountries(data);
  } catch (error) {
    console.error('Failed to fetch countries catalog', error);
    return [];
  }
}
