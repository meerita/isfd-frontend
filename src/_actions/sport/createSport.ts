/** @format */

'use server';

// File: src/_actions/sport/createSport.ts
// Purpose: Create sports via the admin form wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Sport, SportActionState } from '@/_types/sport';

type CreateSportPayload = Readonly<{
  name: string;
  localizedName: string;
  iconKey?: string;
  image?: string;
  active: boolean;
  visible: boolean;
  popular: boolean;
  status: Sport['status'];
}>;

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalStringValue(
  formData: FormData,
  key: string,
): string | undefined {
  const value = getStringValue(formData, key);
  return value.length > 0 ? value : undefined;
}

function getBooleanValue(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function buildPayload(formData: FormData): CreateSportPayload {
  return {
    name: getStringValue(formData, 'name'),
    localizedName: getStringValue(formData, 'localizedName'),
    iconKey:
      getOptionalStringValue(formData, 'iconKey') ??
      getOptionalStringValue(formData, 'icon'),
    image: getOptionalStringValue(formData, 'image'),
    active: getBooleanValue(formData, 'active'),
    visible: getBooleanValue(formData, 'visible'),
    popular: getBooleanValue(formData, 'popular'),
    status: getBooleanValue(formData, 'active') ? 'active' : 'disabled',
  };
}

function buildRequestBody(
  payload: CreateSportPayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: payload.name,
    localizedName: payload.localizedName,
    visible: payload.visible,
    popular: payload.popular,
    status: payload.status,
  };

  if (payload.iconKey) {
    body.icon = payload.iconKey;
  }

  if (payload.image) {
    body.image = payload.image;
  }

  return body;
}

export async function createSport(
  _prevState: SportActionState,
  formData: FormData,
): Promise<SportActionState> {
  const payload = buildPayload(formData);
  const body = buildRequestBody(payload);
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.post(API_ROUTES.SPORTS, body, {
      headers,
    });
    revalidatePath(NAVIGATION.SPORTS);
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
