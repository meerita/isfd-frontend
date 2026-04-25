/** @format */

'use server';

// File: src/_actions/place/updatePlace.ts
// Purpose: Update existing places via PATCH reusing auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { PlaceActionState, PlaceOpeningHour } from '@/_types/place';

const FORM_ERROR_RESPONSE: PlaceActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing place identifier.',
    error: 'Place identifier is required to update the record.',
  },
};

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

function getOptionalNumberValue(
  formData: FormData,
  key: string,
): number | undefined {
  const value = getStringValue(formData, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getListValue(formData: FormData, key: string): string[] {
  const value = getStringValue(formData, key);

  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getSportIdsValue(formData: FormData): string[] {
  const selectedSportId = getStringValue(formData, 'sportID');

  if (selectedSportId) {
    return [selectedSportId];
  }

  return getListValue(formData, 'sportIDs');
}

function getOpeningHoursValue(formData: FormData): ReadonlyArray<PlaceOpeningHour> {
  const value = getStringValue(formData, 'openingHours');

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(function isValidOpeningHour(entry) {
      return (
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.day === 'string' &&
        Array.isArray(entry.ranges)
      );
    }) as ReadonlyArray<PlaceOpeningHour>;
  } catch {
    return [];
  }
}

function buildBody(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  const name = getOptionalStringValue(formData, 'name');
  if (name) {
    body.name = name;
  }

  const description = getOptionalStringValue(formData, 'description');
  if (description) {
    body.description = description;
  }

  const cityID = getOptionalStringValue(formData, 'cityID');
  if (cityID) {
    body.cityID = cityID;
  }

  const ownerID = getOptionalStringValue(formData, 'ownerID');
  if (ownerID) {
    body.ownerID = ownerID;
  }

  const visibility = getOptionalStringValue(formData, 'visibility');
  if (visibility) {
    body.visibility = visibility;
  }

  const latitude = getOptionalNumberValue(formData, 'latitude');
  const longitude = getOptionalNumberValue(formData, 'longitude');
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    body.coordinates = {
      lat: latitude,
      lng: longitude,
    };
  }

  const street = getOptionalStringValue(formData, 'street');
  const streetNumber = getOptionalStringValue(formData, 'streetNumber');
  const postalCode = getOptionalStringValue(formData, 'postalCode');
  const formatted = getOptionalStringValue(formData, 'formattedAddress');
  if (street || streetNumber || postalCode || formatted) {
    body.address = {
      street,
      streetNumber,
      postalCode,
      formatted,
    };
  }

  const sportIDs = getSportIdsValue(formData);
  if (sportIDs.length > 0) {
    body.sportIDs = sportIDs;
  }

  const avatarURL = getOptionalStringValue(formData, 'avatarURL');
  if (avatarURL) {
    body.avatarURL = avatarURL;
  }

  const images = getListValue(formData, 'images');
  if (images.length > 0) {
    body.images = images;
  }

  const website = getOptionalStringValue(formData, 'website');
  const phone = getOptionalStringValue(formData, 'phone');
  const email = getOptionalStringValue(formData, 'email');
  const instagram = getOptionalStringValue(formData, 'instagram');
  const facebook = getOptionalStringValue(formData, 'facebook');
  if (website || phone || email || instagram || facebook) {
    body.contact = {
      website,
      phone,
      email,
      instagram,
      facebook,
    };
  }

  const googlePlaceID = getOptionalStringValue(formData, 'googlePlaceID');
  const applePlaceID = getOptionalStringValue(formData, 'applePlaceID');
  if (googlePlaceID || applePlaceID) {
    body.externalIDs = {
      googlePlaceID,
      applePlaceID,
    };
  }

  const amenities = getListValue(formData, 'amenities');
  if (amenities.length > 0) {
    body.amenities = amenities;
  }

  body.openingHours = getOpeningHoursValue(formData);

  return body;
}

export async function updatePlace(
  _prevState: PlaceActionState,
  formData: FormData,
): Promise<PlaceActionState> {
  const placeId = getStringValue(formData, 'placeId');

  if (!placeId) {
    return FORM_ERROR_RESPONSE;
  }

  const body = buildBody(formData);
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(API_ROUTES.PLACE_BY_ID(placeId), body, {
      headers,
    });

    revalidatePath(NAVIGATION.PLACES);
    revalidatePath(NAVIGATION.PLACE_BY_ID(placeId));

    return {
      status: 'success',
      placeId,
    } satisfies PlaceActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies PlaceActionState;
  }
}
