/** @format */

// File: src/_types/genders.ts
// Purpose: Share the allowed gender string literals across the app
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export type Gender = (typeof GENDERS)[number];
