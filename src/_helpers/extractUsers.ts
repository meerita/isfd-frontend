/** @format */

// File: src/_helpers/extractUsers.ts
// Purpose: Normalize API payloads into a predictable users array
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { User } from '@/_types/user';

type UserPayload =
  | ReadonlyArray<User>
  | Readonly<{ results?: unknown; data?: unknown }>
  | Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function extractUsers(payload: UserPayload): User[] {
  if (Array.isArray(payload)) {
    return payload as User[];
  }

  if (isRecord(payload)) {
    const { results, data } = payload as { results?: unknown; data?: unknown };

    if (Array.isArray(results)) {
      return results as User[];
    }

    if (Array.isArray(data)) {
      return data as User[];
    }
  }

  return [];
}
