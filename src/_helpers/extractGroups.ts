/** @format */

// File: src/_helpers/extractGroups.ts
// Purpose: Normalize API payloads into a predictable groups array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Group } from '@/_types/group';

type GroupPayload =
  | ReadonlyArray<Group>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractGroups(payload: GroupPayload): Group[] {
  if (Array.isArray(payload)) {
    return payload as Group[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as Group[];
    }

    if (Array.isArray(data)) {
      return data as Group[];
    }
  }

  return [];
}
