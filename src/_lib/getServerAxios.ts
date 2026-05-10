/** @format */

// File: src/_lib/getServerAxios.ts
// Purpose: Returns a fresh Axios instance with Bearer token from server-side cookies.
//          Use this in Server Actions and Server Components instead of mutating the shared instance.
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import api from '@/_lib/axiosInstance';

import { getAuthenticatedRequestHeaders } from './authTokens';

export default async function getServerAxios() {
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
  const client = api.create({ headers });

  delete client.defaults.headers.common['Content-Type'];
  delete client.defaults.headers.post['Content-Type'];
  delete client.defaults.headers.put['Content-Type'];
  delete client.defaults.headers.patch['Content-Type'];

  return client;
}
