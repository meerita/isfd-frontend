/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteBrandResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteBrand(brandId: string): Promise<DeleteBrandResult> {
  if (!brandId) {
    return {
      success: false,
      reason: 'FORM_VALIDATION_ERROR',
      error: 'Missing brand identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[deleteBrand] DELETE /admin/brands/:id payload', { brandId });
    }

    await client.delete(API_ROUTES.BRAND_ADMIN_BY_ID(brandId));

    if (process.env.NODE_ENV === 'development') {
      console.log('[deleteBrand] DELETE /admin/brands/:id response', { brandId });
    }

    revalidatePath(NAVIGATION.BRANDS);
    revalidatePath(NAVIGATION.BRAND_BY_ID(brandId));
    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    return {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
  }
}
