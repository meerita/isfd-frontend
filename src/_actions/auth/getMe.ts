/** @format */

'use server';

// File: src/_actions/auth/getMe.ts
// Purpose: Fetch the authenticated user profile from /api/v1/me
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { getMe as getAccountMe } from '@/_actions/account/getMe';
import type { AuthUser } from '@/_types/auth';

export async function getMe(): Promise<AuthUser | null> {
  const result = await getAccountMe();
  return result.data;
}
