/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { BrandDetailResponse } from '@/_types/brand';
import { mapBrand } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.brand) && typeof payload.brand.id === 'string') return payload.brand;
  return null;
}

export async function getAdminBrandById(brandId: string): Promise<BrandDetailResponse> {
  if (!brandId) {
    return {
      data: null,
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing brand identifier.',
        error: 'Brand identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.BRAND_ADMIN_BY_ID(brandId));
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid brand response.',
          error: 'The brand detail response was not valid.',
        },
      };
    }

    return { data: mapBrand(raw) };
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
