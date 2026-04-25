/** @format */

'use server';

// File: src/_actions/event/getEventById.ts
// Purpose: Fetch a single event by id reusing server-side auth context
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { Event } from '@/_types/event';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function isEvent(value: unknown): value is Event {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.title === 'string';
}

function normalizeEvent(payload: unknown): Event | null {
  if (isEvent(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    if (isEvent(payload.data)) {
      return payload.data;
    }

    if (isEvent(payload.event)) {
      return payload.event;
    }
  }

  return null;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  if (!eventId) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.EVENT_BY_ID(eventId), {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    return normalizeEvent(data);
  } catch (error) {
    console.error(`Failed to fetch event with id ${eventId}`, error);
    return null;
  }
}
