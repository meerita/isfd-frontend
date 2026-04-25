/** @format */

// File: src/_helpers/extractSports.ts
// Purpose: Normalize API payloads into a predictable sports array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Sport } from '@/_types/sport';

type SportPayload =
  | ReadonlyArray<Sport>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>
  | unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractSports(payload: SportPayload): Sport[] {
  if (Array.isArray(payload)) {
    return payload as Sport[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as Sport[];
    }

    if (Array.isArray(data)) {
      return data as Sport[];
    }
  }

  return [];
}
