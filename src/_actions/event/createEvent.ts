/** @format */

'use server';

// File: src/_actions/event/createEvent.ts
// Purpose: Create events via the admin form wiring auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { EventActionState } from '@/_types/event';

import {
  buildEventRequestBody,
  resolveEventId,
} from './_helpers';

export async function createEvent(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const { body, error } = buildEventRequestBody(formData);

  if (!body || error) {
    return {
      status: 'error',
      error,
    } satisfies EventActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    const response = await api.post(API_ROUTES.EVENTS, body, {
      headers,
    });
    const eventId = resolveEventId(response.data);

    revalidatePath(NAVIGATION.EVENTS);

    if (eventId) {
      revalidatePath(NAVIGATION.EVENT_BY_ID(eventId));
    }

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
