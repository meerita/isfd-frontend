/** @format */

import React from 'react';
import {
  GRID_TYPES,
  GAPS,
  COLUMNS_NUMBER,
  PADDING_VALUES,
  MARGIN_VALUES,
  GRID_ALIGNMENTS,
  GRID_JUSTIFY_ITEMS,
} from '@/_constants/box';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  display?: keyof typeof GRID_TYPES;
  gap?: keyof typeof GAPS;
  columns?: keyof typeof COLUMNS_NUMBER;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  alignItems?: keyof typeof GRID_ALIGNMENTS;
  justifyItems?: keyof typeof GRID_JUSTIFY_ITEMS;
  border?: boolean;
}

export default function Grid({
  children,
  display = 'grid',
  gap,
  columns,
  padding,
  margin,
  alignItems = 'start',
  justifyItems,
  border = false,
  className = '',
  ...rest
}: Readonly<GridProps>) {
  const classList = [
    GRID_TYPES[display],
    gap === undefined ? '' : GAPS[gap],
    columns === undefined ? '' : COLUMNS_NUMBER[columns],
    padding === undefined ? '' : PADDING_VALUES[padding],
    margin === undefined ? '' : MARGIN_VALUES[margin],
    alignItems === undefined ? '' : GRID_ALIGNMENTS[alignItems],
    justifyItems === undefined ? '' : GRID_JUSTIFY_ITEMS[justifyItems],
    border ? 'border-dp' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classList} {...rest}>
      {children}
    </div>
  );
}
