/** @format */

import React from 'react';
import {
  BACKGROUND_COLORS,
  BORDER_RADIUS,
  CONTENT_DIRECTIONS,
  DISPLAY_TYPES,
  ELEVATION_LEVELS,
  GAPS,
  GRID_ALIGNMENTS,
  MARGIN_VALUES,
  PADDING_VALUES,
} from '@/_constants/box';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  display?: keyof typeof DISPLAY_TYPES;
  gap?: keyof typeof GAPS;
  padding?: keyof typeof PADDING_VALUES;
  margin?: keyof typeof MARGIN_VALUES;
  elevation?: keyof typeof ELEVATION_LEVELS;
  alignItems?: keyof typeof GRID_ALIGNMENTS;
  backgroundColor?: keyof typeof BACKGROUND_COLORS;
  borderRadius?: keyof typeof BORDER_RADIUS;
  flexDirection?: keyof typeof CONTENT_DIRECTIONS;
  border?: boolean;
}

export default function Box({
  children,
  display = 'block',
  gap,
  padding,
  margin,
  alignItems,
  elevation,
  flexDirection = 'row',
  backgroundColor,
  borderRadius,
  border = false,
  className = '',
  ...rest
}: Readonly<BoxProps>) {
  const classList = [
    DISPLAY_TYPES[display],
    gap !== undefined ? GAPS[gap] : '',
    padding !== undefined ? PADDING_VALUES[padding] : '',
    margin !== undefined ? MARGIN_VALUES[margin] : '',
    elevation !== undefined ? ELEVATION_LEVELS[elevation] : '',
    backgroundColor !== undefined ? BACKGROUND_COLORS[backgroundColor] : '',
    borderRadius !== undefined ? BORDER_RADIUS[borderRadius] : '',
    alignItems !== undefined ? GRID_ALIGNMENTS[alignItems] : '',
    flexDirection !== undefined ? CONTENT_DIRECTIONS[flexDirection] : '',
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
