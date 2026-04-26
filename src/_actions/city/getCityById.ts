/** @format */

'use server';

// File: src/_actions/city/getCityById.ts
// Purpose: Fetch a single city by id using the public endpoint
// Author: Diego M. Lafuente

import API_ROUTES from '@/_constants/apiRoutes';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type { City } from '@/_types/city';
import { mapCity } from '@/_actions/city/mappers';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.city) && typeof payload.city.id === 'string') return payload.city;
  return null;
}

export async function getCityById(cityId: string): Promise<City | null> {
  if (!cityId) return null;

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const { data } = await api.get<unknown>(API_ROUTES.CITY_ADMIN_BY_ID(cityId), { headers });
    const raw = extractRaw(data);
    return raw ? mapCity(raw) : null;
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode === 404) return null;
    logApiError(normalized);
    return null;
  }
}
