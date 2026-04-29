/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import type { PublicClubDetailResponse } from '@/_types/club';
import { mapPublicClub } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.slug === 'string') return payload;
  if (
    isRecord(payload.data) &&
    typeof payload.data.slug === 'string'
  ) {
    return payload.data;
  }
  if (isRecord(payload.club) && typeof payload.club.slug === 'string') return payload.club;
  return null;
}

export async function getPublicClubBySlug(
  slug: string,
): Promise<PublicClubDetailResponse> {
  if (!slug) {
    return {
      data: null,
      error: {
        reason: 'CLUB_SLUG_REQUIRED',
        message: 'Missing club slug.',
        error: 'Club slug is required.',
      },
    };
  }

  try {
    const { data } = await api.get<unknown>(API_ROUTES.CLUB_BY_SLUG(slug));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid public club response.',
          error: 'The public club response was not valid.',
        },
      };
    }

    return { data: mapPublicClub(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return {
      data: null,
      error: normalized.data,
    };
  }
}
