/** @format */

// File: src/_helpers/extractCities.ts
// Purpose: Normalize API payloads into a predictable cities array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { City } from '@/_types/city';

type CityPayload =
  | ReadonlyArray<City>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function extractCities(payload: CityPayload): City[] {
  if (Array.isArray(payload)) {
    return payload as City[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as City[];
    }

    if (Array.isArray(data)) {
      return data as City[];
    }
  }

  return [];
}
