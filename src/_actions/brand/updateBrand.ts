/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { BrandActionState } from '@/_types/brand';
import { buildUpdateBrandBody } from './payload';

export async function updateBrand(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const { body, error, brandId } = buildUpdateBrandBody(formData);
  if (error || !brandId || !body) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'FORM_VALIDATION_ERROR',
          message: 'Missing brand identifier.',
          error: 'Brand identifier is required to update the record.',
        },
      }
    );
  }

  if (Object.keys(body).length === 0) {
    return {
      status: 'success',
      brandId,
    } satisfies BrandActionState;
  }

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[updateBrand] PATCH /admin/brands/:id payload', {
        brandId,
        body,
      });
    }

    const { data } = await client.patch<unknown>(
      API_ROUTES.BRAND_ADMIN_BY_ID(brandId),
      body,
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[updateBrand] PATCH /admin/brands/:id response', data);
    }

    revalidatePath(NAVIGATION.BRANDS);
    revalidatePath(NAVIGATION.BRAND_BY_ID(brandId));

    return {
      status: 'success',
      brandId,
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
