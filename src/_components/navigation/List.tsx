/** @format */

import React from 'react';
import {
  DISPLAY_TYPES,
  GAPS,
  PADDING_VALUES,
  MARGIN_VALUES,
  COLUMNS,
} from '@/_constants/box';

export interface ListProps
  extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  horizontal?: boolean;
  ordered?: boolean;
  display?: keyof typeof DISPLAY_TYPES;
  gap?: keyof typeof GAPS;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  columns?: keyof typeof COLUMNS;
  className?: string;
}

export default function List({
  children,
  horizontal = false,
  ordered,
  display,
  gap = 2,
  padding = 0,
  margin = 0,
  columns,
  className = '',
  ...rest
}: Readonly<ListProps>) {
  const ListTag = ordered ? 'ol' : 'ul';

  const isColumns = columns !== undefined;
  const effectiveDisplay =
    display ?? (horizontal ? 'flex' : isColumns ? 'block' : 'grid'); // fallback según orientación, block for CSS columns

  const classList = [
    DISPLAY_TYPES[effectiveDisplay],
    'list-style-type--none',
    GAPS[gap],
    PADDING_VALUES[padding],
    MARGIN_VALUES[margin],
    columns !== undefined && COLUMNS[columns],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ListTag className={classList} {...rest}>
      {children}
    </ListTag>
  );
}
