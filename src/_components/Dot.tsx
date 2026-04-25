/** @format */

import { BACKGROUND_COLORS } from '@/_constants/box'; // o '@/constants/box'

export interface DotProps {
  active?: boolean;
  inline?: boolean;
  className?: string;
  title?: string;
  backgroundColor?: keyof typeof BACKGROUND_COLORS;
  activeBackgroundColor?: keyof typeof BACKGROUND_COLORS;
}

export default function Dot({
  active = false,
  inline = false,
  title = 'Active',
  className = '',
  backgroundColor = 'almostWhite',
  activeBackgroundColor = 'black',
}: Readonly<DotProps>) {
  const colorClass = active
    ? BACKGROUND_COLORS[activeBackgroundColor]
    : BACKGROUND_COLORS[backgroundColor];

  const dotStyles = [
    'c-dot',
    colorClass,
    inline ? 'display--inline-block' : 'display--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={dotStyles} title={title}></span>;
}
