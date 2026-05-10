/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import NAVIGATION from '@/_constants/navigation';
import type { StadiumImageActionState } from '@/_types/stadium';
import { uploadAdminStadiumImages } from './api';

const MISSING_ID_RESPONSE: StadiumImageActionState = {
  status: 'error',
  error: {
    reason: 'STADIUM_ID_REQUIRED',
    message: 'Missing stadium identifier.',
    error: 'Stadium identifier is required to upload images.',
  },
};

export async function uploadStadiumImages(
  _prevState: StadiumImageActionState,
  formData: FormData,
): Promise<StadiumImageActionState> {
  const stadiumId = (formData.get('stadium_id') as string | null)?.trim() ?? '';
  if (!stadiumId) {
    return MISSING_ID_RESPONSE;
  }

  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return {
      status: 'error',
      error: {
        reason: 'STADIUM_IMAGES_REQUIRED',
        message: 'Select at least one stadium image.',
        error: 'Select at least one stadium image.',
      },
    };
  }

  if (files.length > 10) {
    return {
      status: 'error',
      error: {
        reason: 'INVALID_REQUEST',
        message: 'You can upload up to 10 images at once.',
        error: 'You can upload up to 10 images at once.',
      },
    };
  }

  const oversizedFile = files.find(file => file.size > 10 * 1024 * 1024);
  if (oversizedFile) {
    return {
      status: 'error',
      error: {
        reason: 'INVALID_REQUEST',
        message: `"${oversizedFile.name}" exceeds the 10 MB file limit.`,
        error: `"${oversizedFile.name}" exceeds the 10 MB file limit.`,
      },
    };
  }

  const response = await uploadAdminStadiumImages(stadiumId, files);
  if (!response.data) {
    return {
      status: 'error',
      error: response.error,
      stadiumId,
    };
  }

  revalidatePath(NAVIGATION.STADIUMS);
  revalidatePath(NAVIGATION.STADIUM_BY_ID(stadiumId));

  return {
    status: 'success',
    stadiumId,
  };
}
