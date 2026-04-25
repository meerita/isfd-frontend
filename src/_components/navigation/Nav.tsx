/** @format */

import React from 'react';
import { DISPLAY_TYPES, PADDING_VALUES, MARGIN_VALUES } from '@/_constants/box';

export interface NavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  display?: keyof typeof DISPLAY_TYPES;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
  border?: boolean;
}

export default function Nav({
  children,
  display,
  padding = 0,
  margin = 0,
  className = '',
  border = false,
  ...rest
}: Readonly<NavProps>) {
  const classList = [
    display ? DISPLAY_TYPES[display] : '',
    PADDING_VALUES[padding],
    MARGIN_VALUES[margin],
    className,
    border ? 'border-dp' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classList} {...rest}>
      {children}
    </nav>
  );
}
