/** @format */

'use server';

// File: src/_actions/place/createPlace.ts
// Purpose: Create places via the admin form wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type {
  Place,
  PlaceActionState,
  PlaceOpeningHour,
} from '@/_types/place';

type PlaceRequestBody = Readonly<{
  name: string;
  description?: string;
  cityID: string;
  coordinates?: Readonly<{
    lat: number;
    lng: number;
  }>;
  address?: Readonly<{
    street?: string;
    streetNumber?: string;
    postalCode?: string;
    formatted?: string;
  }>;
  sportIDs?: ReadonlyArray<string>;
  avatarURL?: string;
  images?: ReadonlyArray<string>;
  contact?: Readonly<{
    website?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
  }>;
  externalIDs?: Readonly<{
    googlePlaceID?: string;
    applePlaceID?: string;
  }>;
  openingHours?: ReadonlyArray<PlaceOpeningHour>;
  ownerID: string;
  visibility: string;
  amenities?: ReadonlyArray<string>;
}>;

const FORM_ERROR_RESPONSE: PlaceActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing required place fields.',
    error: 'Name, city, owner and visibility are required.',
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

function buildBody(formData: FormData): PlaceRequestBody | null {
  const name = getStringValue(formData, 'name');
  const cityID = getStringValue(formData, 'cityID');
  const ownerID = getStringValue(formData, 'ownerID');
  const visibility = getStringValue(formData, 'visibility');
  const latitude = getOptionalNumberValue(formData, 'latitude');
  const longitude = getOptionalNumberValue(formData, 'longitude');
  const sportIDs = getSportIdsValue(formData);
  const images = getListValue(formData, 'images');
  const amenities = getListValue(formData, 'amenities');
  const openingHours = getOpeningHoursValue(formData);

  if (!name || !cityID || !ownerID || !visibility) {
    return null;
  }

  const body: Record<string, unknown> = {
    name,
    cityID,
    ownerID,
    visibility,
  };

  const description = getOptionalStringValue(formData, 'description');
  if (description) {
    body.description = description;
  }

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

  if (sportIDs.length > 0) {
    body.sportIDs = sportIDs;
  }

  const avatarURL = getOptionalStringValue(formData, 'avatarURL');
  if (avatarURL) {
    body.avatarURL = avatarURL;
  }

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

  if (amenities.length > 0) {
    body.amenities = amenities;
  }

  if (openingHours.length > 0) {
    body.openingHours = openingHours;
  }

  return body as PlaceRequestBody;
}

function resolvePlaceId(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  if ('id' in payload && typeof payload.id === 'string') {
    return payload.id;
  }

  if (
    'data' in payload &&
    typeof payload.data === 'object' &&
    payload.data !== null &&
    'id' in payload.data &&
    typeof payload.data.id === 'string'
  ) {
    return payload.data.id;
  }

  return undefined;
}

export async function createPlace(
  _prevState: PlaceActionState,
  formData: FormData,
): Promise<PlaceActionState> {
  const body = buildBody(formData);

  if (!body) {
    return FORM_ERROR_RESPONSE;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const response = await api.post<Place | { data?: Place }>(
      API_ROUTES.PLACES,
      body,
      {
        headers,
      },
    );

    const placeId = resolvePlaceId(response.data);

    revalidatePath(NAVIGATION.PLACES);

    if (placeId) {
      revalidatePath(NAVIGATION.PLACE_BY_ID(placeId));
    }

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
