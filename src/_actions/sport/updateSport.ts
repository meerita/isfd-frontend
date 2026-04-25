/** @format */

'use server';

// File: src/_actions/sport/updateSport.ts
// Purpose: Update an existing sport via PATCH reusing auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Sport, SportActionState } from '@/_types/sport';

type UpdateSportPayload = Readonly<{
  sportId: Sport['id'] | null;
  name: string;
  localizedName: string;
  iconKey?: string;
  image: string;
  active: boolean;
  visible: boolean;
  popular: boolean;
  status: Sport['status'];
}>;

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getBooleanValue(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function buildPayload(formData: FormData): UpdateSportPayload {
  return {
    sportId: getStringValue(formData, 'sportId') || null,
    name: getStringValue(formData, 'name'),
    localizedName: getStringValue(formData, 'localizedName'),
    iconKey:
      getStringValue(formData, 'iconKey') || getStringValue(formData, 'icon'),
    image: getStringValue(formData, 'image'),
    active: getBooleanValue(formData, 'active'),
    visible: getBooleanValue(formData, 'visible'),
    popular: getBooleanValue(formData, 'popular'),
    status: getBooleanValue(formData, 'active') ? 'active' : 'disabled',
  };
}

function buildRequestBody(
  payload: UpdateSportPayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: payload.name,
    localizedName: payload.localizedName,
    image: payload.image,
    visible: payload.visible,
    popular: payload.popular,
    status: payload.status,
  };

  if (payload.iconKey) {
    body.icon = payload.iconKey;
  }

  return body;
}

const FORM_ERROR_RESPONSE: SportActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing sport identifier.',
    error: 'Sport identifier is required to update the record.',
  },
};

export async function updateSport(
  _prevState: SportActionState,
  formData: FormData,
): Promise<SportActionState> {
  const payload = buildPayload(formData);

  if (!payload.sportId) {
    return FORM_ERROR_RESPONSE;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(
      API_ROUTES.SPORT_BY_ID(payload.sportId),
      buildRequestBody(payload),
      {
        headers,
      },
    );

    revalidatePath(NAVIGATION.SPORTS);
    revalidatePath(NAVIGATION.SPORT_BY_ID(payload.sportId));

    return { status: 'success' } satisfies SportActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies SportActionState;
  }
}
