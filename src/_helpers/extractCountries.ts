/** @format */

// File: src/_helpers/extractCountries.ts
// Purpose: Normalize API payloads into a predictable countries array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Country } from '@/_types/country';

type CountryPayload =
  | ReadonlyArray<Country>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>
  | unknown;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function extractCountries(payload: CountryPayload): Country[] {
  if (Array.isArray(payload)) {
    return payload as Country[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as Country[];
    }

    if (Array.isArray(data)) {
      return data as Country[];
    }
  }

  return [];
}
