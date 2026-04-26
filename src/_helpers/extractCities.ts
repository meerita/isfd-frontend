/** @format */

// File: src/_helpers/extractCities.ts
// Purpose: Normalize API payloads into a predictable cities array
// Author: Diego M. Lafuente

import type { City } from '@/_types/city';

type AnyPayload = ReadonlyArray<City> | Readonly<{ data?: unknown }> | unknown;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export function extractCities(payload: AnyPayload): City[] {
  if (Array.isArray(payload)) {
    return payload as City[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.data)) return payload.data as City[];
    if (Array.isArray(payload.results)) return payload.results as City[];
  }

  return [];
}
