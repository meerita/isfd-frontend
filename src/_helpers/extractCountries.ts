/** @format */

// File: src/_helpers/extractCountries.ts
// Purpose: Normalize API payloads into a predictable countries array
// Author: Diego M. Lafuente

import type { Country } from '@/_types/country';

type AnyPayload = ReadonlyArray<Country> | Readonly<{ data?: unknown }> | unknown;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export function extractCountries(payload: AnyPayload): Country[] {
  if (Array.isArray(payload)) {
    return payload as Country[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.data)) return payload.data as Country[];
    if (Array.isArray(payload.results)) return payload.results as Country[];
  }

  return [];
}
