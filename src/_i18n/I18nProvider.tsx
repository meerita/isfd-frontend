/** @format */
/**
 * @file src/_i18n/I18nProvider.tsx
 * @description Provides locale and dictionary state to client components.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';

import type { AppLocale } from './config';
import type { AppDictionary } from './getDictionary';

type I18nContextValue = Readonly<{
  locale: AppLocale;
  dictionary: AppDictionary;
}>;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  locale,
  dictionary,
}: Readonly<{
  children: React.ReactNode;
  locale: AppLocale;
  dictionary: AppDictionary;
}>): React.JSX.Element {
  const contextValue = useMemo<I18nContextValue>(
    function buildContextValue() {
      return {
        locale,
        dictionary,
      };
    },
    [locale, dictionary],
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}
