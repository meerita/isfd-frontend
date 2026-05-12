/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import type { StadiumActionState } from '@/_types/stadium';
import { createAdminStadium } from './api';
import { buildCreateStadiumBody } from './payload';

export async function createStadium(
  _prevState: StadiumActionState,
  formData: FormData,
): Promise<StadiumActionState> {
  const { body, error } = buildCreateStadiumBody(formData);
  if (error || !body) {
    return error ?? { status: 'error' };
  }

  const response = await createAdminStadium(body);
  if (!response.data) {
    return {
      status: 'error',
      error: response.error,
    };
  }

  revalidatePath(NAVIGATION.STADIUMS);
  revalidatePath(NAVIGATION.CREATE_A_STADIUM);
  revalidatePath(NAVIGATION.STADIUM_BY_ID(response.data.id));

  return {
    status: 'success',
    stadiumId: response.data.id,
  };
}
