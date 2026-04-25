/** @format */

// File: src/_helpers/normalizeGroupVisibility.ts
// Purpose: Normalize legacy and current group visibility values to the API contract
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { GroupVisibility } from '@/_types/group';

const LEGACY_HIDDEN_GROUP_VISIBILITY = 'HIDDEN';
const API_HIDDEN_GROUP_VISIBILITY = 'INVISIBLE';

export function normalizeGroupVisibility(
  visibility?: string,
): GroupVisibility | undefined {
  const normalizedVisibility = visibility?.trim().toUpperCase();

  if (!normalizedVisibility) {
    return undefined;
  }

  if (normalizedVisibility === LEGACY_HIDDEN_GROUP_VISIBILITY) {
    return API_HIDDEN_GROUP_VISIBILITY;
  }

  return normalizedVisibility as GroupVisibility;
}

export function isVisibleGroupVisibility(visibility?: string): boolean {
  return normalizeGroupVisibility(visibility) === 'VISIBLE';
}
