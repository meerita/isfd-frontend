/** @format */

'use server';

// File: src/_actions/event/getEvents.ts
// Purpose: Fetch paginated events list from the admin endpoint using auth cookies
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import { extractEvents } from '@/_helpers/extractEvents';
import { ACCESS_TOKEN_COOKIE } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { EventsResponse, EventStatus } from '@/_types/event';

type EventsQuery = Readonly<{
  page?: number;
  limit?: number;
  sport?: string;
  group?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: EventStatus;
}>;

const DEFAULT_QUERY: Readonly<{ page: number; limit: number }> = {
  page: 1,
  limit: 20,
};

const EMPTY_EVENTS_RESPONSE: EventsResponse = {
  data: [],
  pagination: {
    page: DEFAULT_QUERY.page,
    limit: DEFAULT_QUERY.limit,
    totalItems: 0,
    totalPages: 0,
  },
};

function buildParams(query: EventsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? DEFAULT_QUERY.page,
    limit: query.limit ?? DEFAULT_QUERY.limit,
  };

  if (query.sport?.trim()) {
    params.sport = query.sport.trim();
  }

  if (query.group?.trim()) {
    params.group = query.group.trim();
  }

  if (query.dateFrom?.trim()) {
    params.dateFrom = query.dateFrom.trim();
  }

  if (query.dateTo?.trim()) {
    params.dateTo = query.dateTo.trim();
  }

  if (query.status?.trim()) {
    params.status = query.status.trim();
  }

  return params;
}

export async function getEvents(
  query: EventsQuery = {},
): Promise<EventsResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const { data } = await api.get<unknown>(API_ROUTES.EVENTS, {
      params: buildParams(query),
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });

    const events = extractEvents(data);
    const pagination =
      typeof data === 'object' && data !== null && 'pagination' in data
        ? (data.pagination as Partial<EventsResponse['pagination']>)
        : undefined;

    return {
      data: events,
      pagination: {
        page: pagination?.page ?? (query.page ?? DEFAULT_QUERY.page),
        limit: pagination?.limit ?? (query.limit ?? DEFAULT_QUERY.limit),
        totalItems: pagination?.totalItems ?? events.length,
        totalPages: pagination?.totalPages ?? 1,
      },
    } satisfies EventsResponse;
  } catch (error) {
    console.error('Failed to fetch events', error);
    return EMPTY_EVENTS_RESPONSE;
  }
}
