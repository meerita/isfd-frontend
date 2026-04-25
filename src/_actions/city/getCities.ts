/** @format */

'use server';

// File: src/_actions/city/getCities.ts
// Purpose: Fetch paginated cities by country code while wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CitiesResponse } from '@/_types/city';

const EMPTY_CITIES_RESPONSE: CitiesResponse = {
  data: [],
  pagination: {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
  },
};

export async function getCities({
  countryCode,
  province,
  page,
  limit,
}: Readonly<{
  countryCode?: string;
  province?: string;
  page?: number;
  limit?: number;
}>): Promise<CitiesResponse> {
  if (!countryCode) {
    return EMPTY_CITIES_RESPONSE;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const params: Record<string, string | number> = { countryCode };

  if (province) {
    params.province = province;
  }

  if (typeof page === 'number') {
    params.page = page;
  }

  if (typeof limit === 'number') {
    params.limit = limit;
  }

  try {
    const { data } = await api.get<CitiesResponse>(API_ROUTES.CITIES, {
      params,
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return data;
  } catch (error) {
    console.error(`Failed to fetch cities for ${countryCode}`, error);
    return EMPTY_CITIES_RESPONSE;
  }
}
