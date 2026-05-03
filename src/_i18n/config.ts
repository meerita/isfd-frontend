/** @format */
/**
 * @file src/_i18n/config.ts
 * @description Defines locale configuration and locale guards for the application.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

export const DEFAULT_LOCALE = 'es' as const;
export const FALLBACK_LOCALE = 'en' as const;
export const LOCALE_COOKIE_NAME = 'locale';
export const BROWSER_LANGUAGE_IS_ENABLED = false;

export const SUPPORTED_LOCALES = ['es', 'ja', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function localeIsSupported(
  value: string | null | undefined,
): value is AppLocale {
  if (!value) {
    return false;
  }

  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
