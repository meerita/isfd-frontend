/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import { deleteAdminStadiumImage } from './api';

export type DeleteStadiumImageResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteStadiumImage(
  stadiumId: string,
  attachmentId: string,
): Promise<DeleteStadiumImageResult> {
  if (!stadiumId || !attachmentId) {
    return {
      success: false,
      reason: 'INVALID_REQUEST',
      error: 'Stadium and attachment identifiers are required.',
    };
  }

  const response = await deleteAdminStadiumImage(stadiumId, attachmentId);
  if (!response.success) {
    return {
      success: false,
      reason: response.error?.reason,
      error: response.error?.error ?? response.error?.message,
    };
  }

  revalidatePath(NAVIGATION.STADIUMS);
  revalidatePath(NAVIGATION.STADIUM_BY_ID(stadiumId));

  return { success: true };
}
