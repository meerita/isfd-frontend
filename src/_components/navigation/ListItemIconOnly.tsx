/** @format */

import Link from 'next/link';
import Icon from '../Icon';
import { BACKGROUND_COLORS, HOVERED_BACKGROUND_COLORS } from '@/_constants/box';
import { HOVERED_TEXT_COLORS, TEXT_COLORS } from '@/_constants/typography';

export default function ListItemIconOnly({
  href,
  active = false,
  icon = '',
  ...rest
}: Readonly<{
  href: string;
  active?: boolean;
  icon: string;
}>) {
  const listStyles = [
    'list-style-type--none',
    'font-size--12',
    'text-decoration-line--none',
    'border-radius--5',
    'padding-inline--10',
    'padding-block--8',
    active
      ? HOVERED_BACKGROUND_COLORS.lighterGreen
      : HOVERED_BACKGROUND_COLORS.darkerGreen,
    active ? HOVERED_TEXT_COLORS.white : HOVERED_TEXT_COLORS.almostWhite,
    'display--block',
    active ? TEXT_COLORS.white : TEXT_COLORS.almostWhite,
    active ? BACKGROUND_COLORS.green : BACKGROUND_COLORS.transparent,
  ];

  return (
    <li {...rest}>
      <Link href={href} className={listStyles.join(' ')} prefetch={true}>
        <Icon fill={active ? 'white' : 'green'} name={icon} size={24} />
      </Link>
    </li>
  );
}
