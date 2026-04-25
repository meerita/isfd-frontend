/** @format */

'use server';

// File: src/_actions/event/updateEvent.ts
// Purpose: Update existing events via PATCH reusing auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { EventActionState } from '@/_types/event';

import { buildEventRequestBody, getStringValue } from './_helpers';

const FORM_ERROR_RESPONSE: EventActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing event identifier.',
    error: 'Event identifier is required to update the record.',
  },
};

export async function updateEvent(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const eventId = getStringValue(formData, 'eventId');

  if (!eventId) {
    return FORM_ERROR_RESPONSE;
  }

  const { body, error } = buildEventRequestBody(formData);

  if (!body || error) {
    return {
      status: 'error',
      error,
    } satisfies EventActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(API_ROUTES.EVENT_BY_ID(eventId), body, {
      headers,
    });

    revalidatePath(NAVIGATION.EVENTS);
    revalidatePath(NAVIGATION.EVENT_BY_ID(eventId));

    return {
      status: 'success',
      eventId,
    } satisfies EventActionState;
  } catch (requestError) {
    const normalized = normalizeApiError(requestError);
    logApiError(normalized);

    return {
      status: 'error',
      error: normalized.data,
    } satisfies EventActionState;
  }
}
