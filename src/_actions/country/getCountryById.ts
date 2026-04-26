/** @format */

'use server';

// File: src/_actions/country/getCountryById.ts
// Purpose: Fetch a single country by id via the admin endpoint
// Author: Diego M. Lafuente

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Country } from '@/_types/country';
import { mapCountry } from '@/_actions/country/mappers';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.country) && typeof payload.country.id === 'string') return payload.country;
  return null;
}

export async function getCountryById(countryId: string): Promise<Country | null> {
  if (!countryId) return null;

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.get<unknown>(
      API_ROUTES.COUNTRY_ADMIN_BY_ID(countryId),
      { headers },
    );

    const raw = extractRaw(data);
    return raw ? mapCountry(raw) : null;
  } catch (error) {
    console.error(`Failed to fetch country ${countryId}`, error);
    return null;
  }
}
