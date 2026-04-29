/** @format */

'use server';

import { redirect } from 'next/navigation';

import Roles from '@/_constants/roles';
import { getAccessTokenPayloadFromCookies } from '@/_lib/authTokens';

const ALLOWED_ADMIN_ROLES = new Set<string>([Roles.ADMIN, Roles.SUPER_ADMIN]);

export default async function requireAdminAccess(): Promise<void> {
  const payload = await getAccessTokenPayloadFromCookies();

  if (!payload?.role || !ALLOWED_ADMIN_ROLES.has(payload.role)) {
    redirect('/forbidden');
  }
}
