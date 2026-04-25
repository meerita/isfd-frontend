/** @format */

import React from 'react';
import {
  TITLE_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  TEXT_COLORS,
  TitleSize,
  FontWeight,
  LineHeight,
  TextColor,
} from '@/_constants/typography';
import { MARGIN_VALUES } from '@/_constants/box';

export interface TitleProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: TitleSize;
  weight?: FontWeight;
  lineHeight?: LineHeight;
  color?: TextColor;
  margin?: keyof typeof MARGIN_VALUES;
  inline?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function Title({
  children,
  size = 'large',
  weight = 'semibold',
  lineHeight = 'normal',
  margin = 0,
  color,
  inline = false,
  className = '',
  as,
  ...rest
}: Readonly<TitleProps>) {
  const Component = inline ? 'span' : as || 'h2';

  const classList = [
    MARGIN_VALUES[margin],
    TITLE_SIZES[size],
    FONT_WEIGHTS[weight],
    LINE_HEIGHTS[lineHeight],
    color ? TEXT_COLORS[color] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={`${classList} margin-block-end--0 margin-block-start--0`}
      {...rest}
    >
      {children}
    </Component>
  );
}
