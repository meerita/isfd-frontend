/** @format */
/**
 * @file src/app/layout.tsx
 * @description Defines the root layout and injects locale-aware UI context for the app.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';

import GLOBALS from '@/_constants/globals';
import { I18nProvider } from '../_i18n/I18nProvider';
import { getDictionary } from '../_i18n/getDictionary';
import { resolveRequestLocale } from '../_i18n/resolveRequestLocale';

import '@/_styles/root.css';
import '@/_styles/normalizer.css';
import '@/_styles/generics.css';
import '@/_styles/md.css';
import '@/_styles/lg.css';
import '@/_styles/xl.css';
import '@/_styles/xxl.css';
import '@/_styles/focus.css';
import '@/_styles/hovers.css';
import '@/_styles/custom.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: GLOBALS.metadata.title,
  description: GLOBALS.metadata.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={manrope.className}>
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
