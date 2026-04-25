/** @format */

// File: src/_helpers/extractEvents.ts
// Purpose: Normalize API payloads into a predictable events array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Event } from '@/_types/event';

type EventPayload =
  | ReadonlyArray<Event>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>
  | unknown;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function extractEvents(payload: EventPayload): Event[] {
  if (Array.isArray(payload)) {
    return payload as Event[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as Event[];
    }

    if (Array.isArray(data)) {
      return data as Event[];
    }
  }

  return [];
}
