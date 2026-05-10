/** @format */

'use server';

import { redirect } from 'next/navigation';

import NAVIGATION from '@/_constants/navigation';
import { clearAuthCookies } from '@/_lib/authTokens';

export async function handleUnauthorized(): Promise<never> {
  await clearAuthCookies();
  redirect(NAVIGATION.LOGIN);
}
