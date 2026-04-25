/** @format */

'use server';

// File: src/_actions/auth/revokeSession.ts
// Purpose: Perform server-side session revocation and clear local auth state (logout)
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import API_ROUTES from '@/_constants/apiRoutes';
import {
  SESSION_ID_COOKIE,
  clearAuthCookies,
  getAuthenticatedRequestHeaders,
} from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';

export async function revokeSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value;
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: false });

  if (sessionId && headers) {
    try {
      await api.post(
        API_ROUTES.AUTH_REVOKE,
        { session_id: sessionId },
        { headers },
      );
    } catch {
      // Session may already be revoked on the server — proceed with local cleanup
    }
  }

  await clearAuthCookies();
  redirect('/');
}
