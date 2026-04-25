/** @format */

import React from 'react';
import {
  TEXT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  TEXT_COLORS,
  TEXT_ALIGN,
  TextSize,
  FontWeight,
  LineHeight,
  TextColor,
  TextAlign,
} from '@/_constants/typography';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: TextSize;
  weight?: FontWeight;
  lineHeight?: LineHeight;
  color?: TextColor;
  inline?: boolean;
  textAlign?: TextAlign;
}

export default function Text({
  children,
  size = 'medium',
  weight = 'medium',
  lineHeight = 'normal',
  color,
  inline = false,
  textAlign,
  className = '',
  ...rest
}: Readonly<TextProps>) {
  const Component = inline ? 'span' : 'p';

  const classList = [
    TEXT_SIZES[size],
    FONT_WEIGHTS[weight],
    LINE_HEIGHTS[lineHeight],
    color ? TEXT_COLORS[color] : '',
    textAlign ? TEXT_ALIGN[textAlign] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={`margin--0 ${classList}`} {...rest}>
      {children}
    </Component>
  );
}
