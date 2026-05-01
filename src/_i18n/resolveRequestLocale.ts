/** @format */
/**
 * @file src/_i18n/resolveRequestLocale.ts
 * @description Resolves the request locale from cookies with application defaults.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import { cookies } from 'next/headers';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  localeIsSupported,
  type AppLocale,
} from './config';

export async function resolveRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (localeIsSupported(cookieLocale)) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}
