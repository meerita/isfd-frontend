/** @format */

'use server';

// File: src/_actions/group/createGroup.ts
// Purpose: Create groups via the admin form wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { normalizeGroupVisibility } from '@/_helpers/normalizeGroupVisibility';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type {
  GroupActionState,
  GroupJoinMode,
  GroupPrivacy,
  GroupStatus,
  GroupVisibility,
} from '@/_types/group';

type CreateGroupPayload = Readonly<{
  name: string;
  description?: string;
  sportId: string;
  privacy: GroupPrivacy;
  visibility: GroupVisibility;
  joinMode: GroupJoinMode;
  status: GroupStatus;
  cityId: string;
  city: string;
  province?: string;
  country: string;
  localizedCountryName: string;
  countryCode: string;
  continent: string;
  latitude?: number;
  longitude?: number;
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

function getNumberValue(formData: FormData, key: string): number | undefined {
  const rawValue = getStringValue(formData, key).replaceAll(',', '.');

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function buildPayload(formData: FormData): CreateGroupPayload {
  return {
    name: getStringValue(formData, 'name'),
    description: getOptionalStringValue(formData, 'description'),
    sportId: getStringValue(formData, 'sportId'),
    privacy: getStringValue(formData, 'privacy') as GroupPrivacy,
    visibility:
      normalizeGroupVisibility(getStringValue(formData, 'visibility')) ??
      'VISIBLE',
    joinMode: getStringValue(formData, 'joinMode') as GroupJoinMode,
    status: getBooleanValue(formData, 'active') ? 'ACTIVE' : 'INACTIVE',
    cityId: getStringValue(formData, 'cityId'),
    city: getStringValue(formData, 'cityName'),
    province: getOptionalStringValue(formData, 'province'),
    country: getStringValue(formData, 'countryName'),
    localizedCountryName: getStringValue(formData, 'localizedCountryName'),
    countryCode: getStringValue(formData, 'countryCode'),
    continent: getStringValue(formData, 'continent'),
    latitude: getNumberValue(formData, 'latitude'),
    longitude: getNumberValue(formData, 'longitude'),
  };
}

function buildRequestBody(
  payload: CreateGroupPayload,
): Record<string, unknown> {
  const location: Record<string, unknown> = {
    continent: payload.continent,
    country: payload.country,
    city: payload.city,
    localizedName: payload.localizedCountryName || payload.country,
  };

  if (payload.province) {
    location.province = payload.province;
  }

  if (
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number'
  ) {
    location.coords = {
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
  }

  const body: Record<string, unknown> = {
    name: payload.name,
    sportId: payload.sportId,
    privacy: payload.privacy,
    visibility: payload.visibility,
    joinMode: payload.joinMode,
    status: payload.status,
    cityId: payload.cityId,
    countryCode: payload.countryCode,
    location,
  };

  if (payload.description) {
    body.description = payload.description;
  }

  return body;
}

export async function createGroup(
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const payload = buildPayload(formData);
  const body = buildRequestBody(payload);
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.post(API_ROUTES.GROUPS, body, {
      headers,
    });
    revalidatePath(NAVIGATION.GROUPS);

    return { status: 'success' } satisfies GroupActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies GroupActionState;
  }
}
