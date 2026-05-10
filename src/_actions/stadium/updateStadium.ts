/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import type { StadiumActionState } from '@/_types/stadium';
import { updateAdminStadium } from './api';
import { buildUpdateStadiumBody } from './payload';

export async function updateStadium(
  _prevState: StadiumActionState,
  formData: FormData,
): Promise<StadiumActionState> {
  const { body, error, stadiumId } = buildUpdateStadiumBody(formData);
  if (error || !body || !stadiumId) {
    return (
      error ?? {
        status: 'error',
        error: {
          reason: 'STADIUM_ID_REQUIRED',
          message: 'Stadium identifier is required to update the record.',
          error: 'Stadium identifier is required to update the record.',
        },
      }
    );
  }

  const response = await updateAdminStadium(stadiumId, body);
  if (!response.data) {
    return {
      status: 'error',
      error: response.error,
    };
  }

  revalidatePath(NAVIGATION.STADIUMS);
  revalidatePath(NAVIGATION.STADIUM_BY_ID(stadiumId));

  return {
    status: 'success',
    stadiumId,
  };
}
