/** @format */

import React from 'react';
import {
  DISPLAY_TYPES,
  GAPS,
  PADDING_VALUES,
  MARGIN_VALUES,
} from '@/_constants/box';

export interface FieldSetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  display?: keyof typeof DISPLAY_TYPES;
  gap?: keyof typeof GAPS;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  className?: string;
}

export default function FieldSet({
  children,
  disabled = false,
  display,
  gap,
  padding = 0,
  margin = 0,
  className = '',
  ...rest
}: Readonly<FieldSetProps>) {
  const classList = [
    'border-width--0',
    PADDING_VALUES[padding],
    MARGIN_VALUES[margin],
    display ? DISPLAY_TYPES[display] : '',
    gap !== undefined ? GAPS[gap] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset className={classList} disabled={disabled} {...rest}>
      {children}
    </fieldset>
  );
}
