/** @format */

// File: src/_helpers/extractPlaces.ts
// Purpose: Normalize API payloads into a predictable places array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Place } from '@/_types/place';

type PlacePayload =
  | ReadonlyArray<Place>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>
  | unknown;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function extractPlaces(payload: PlacePayload): Place[] {
  if (Array.isArray(payload)) {
    return payload as Place[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as Place[];
    }

    if (Array.isArray(data)) {
      return data as Place[];
    }
  }

  return [];
}
