/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import axiosInstance from '@/_lib/axiosInstance';
import type { PersonPublicDetailResponse } from '@/_types/person';
import { mapPersonPublicDetail } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null;
  }

  return typeof payload.slug === 'string' ? payload : null;
}

export async function getPublicPersonBySlug(
  slug: string,
): Promise<PersonPublicDetailResponse> {
  if (!slug) {
    return {
      data: null,
      error: {
        reason: 'PERSON_SLUG_REQUIRED',
        message: 'Missing person slug.',
        error: 'Person slug is required.',
      },
    };
  }

  try {
    const { data } = await axiosInstance.get<unknown>(API_ROUTES.PERSON_BY_SLUG(slug));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid public person response.',
          error: 'The public person response was not valid.',
        },
      };
    }

    return { data: mapPersonPublicDetail(raw) };
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
