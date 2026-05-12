/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import { deleteAdminStadium } from './api';

export type DeleteStadiumResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteStadium(
  stadiumId: string,
): Promise<DeleteStadiumResult> {
  if (!stadiumId) {
    return {
      success: false,
      reason: 'STADIUM_ID_REQUIRED',
      error: 'Missing stadium identifier.',
    };
  }

  const response = await deleteAdminStadium(stadiumId);
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
