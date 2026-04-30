/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { BrandActionState } from '@/_types/brand';
import { mapBrand } from './mappers';
import { buildCreateBrandBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (isRecord(payload.brand) && typeof payload.brand.id === 'string') return payload.brand;
  return null;
}

export async function createBrand(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const { body, error } = buildCreateBrandBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[createBrand] POST /admin/brands payload', body);
    }

    const { data } = await client.post<unknown>(API_ROUTES.BRANDS_ADMIN, body);
    const raw = extractRaw(data);
    const brand = raw ? mapBrand(raw) : null;

    if (process.env.NODE_ENV === 'development') {
      console.log('[createBrand] POST /admin/brands response', raw);
    }

    revalidatePath(NAVIGATION.BRANDS);
    revalidatePath(NAVIGATION.CREATE_A_BRAND);
    if (brand) {
      revalidatePath(NAVIGATION.BRAND_BY_ID(brand.id));
    }

    return {
      status: 'success',
      brandId: brand?.id,
    } satisfies BrandActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies BrandActionState;
  }
}
