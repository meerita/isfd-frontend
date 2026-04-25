/** @format */

import React from 'react';
import { PADDING_VALUES, MARGIN_VALUES } from '@/_constants/box';

export interface MainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
}

export default function Main({
  children,
  padding = 0,
  margin = 0,
  className = '',
  ...rest
}: Readonly<MainProps>) {
  const classList = [
    padding !== undefined ? PADDING_VALUES[padding] : '',
    margin !== undefined ? MARGIN_VALUES[margin] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={classList} {...rest}>
      {children}
    </main>
  );
}
