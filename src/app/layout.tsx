/** @format */

import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';

import GLOBALS from '@/_constants/globals';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: GLOBALS.metadata.title,
  description: GLOBALS.metadata.description,
};

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body className={`${manrope.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
