/** @format */

'use server';

// File: src/_actions/event/deleteEvent.ts
// Purpose: Delete event records via DELETE wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';

type DeleteEventResult = Readonly<{
  success: boolean;
  error?: string;
}>;

export async function deleteEvent(eventId: string): Promise<DeleteEventResult> {
  if (!eventId) {
    return {
      success: false,
      error: 'Missing event identifier.',
    } satisfies DeleteEventResult;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.delete(API_ROUTES.EVENT_BY_ID(eventId), {
      headers,
    });

    revalidatePath(NAVIGATION.EVENTS);

    return { success: true } satisfies DeleteEventResult;
  } catch (requestError) {
    const normalized = normalizeApiError(requestError);
    logApiError(normalized);

    return {
      success: false,
      error:
        normalized.data.error ??
        normalized.data.message ??
        'We could not delete this event.',
    } satisfies DeleteEventResult;
  }
}
