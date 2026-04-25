/** @format */

import Link from 'next/link';
import Icon from '../Icon';
import Text from '../typography/Text';
import Grid from '../layout/Grid';
import {
  BACKGROUND_COLORS,
  HOVERED_BACKGROUND_COLORS,
  FILL_COLORS,
  HOVERED_FILL_COLORS,
  GAPS,
} from '@/_constants/box';
import { HOVERED_TEXT_COLORS, TEXT_COLORS } from '@/_constants/typography';

type ColorKey = keyof typeof BACKGROUND_COLORS;
type HoverColorKey = keyof typeof HOVERED_BACKGROUND_COLORS;
type TextColorKey = keyof typeof TEXT_COLORS;
type HoverTextColorKey = keyof typeof HOVERED_TEXT_COLORS;
type FillColorKey = keyof typeof FILL_COLORS;
type HoverFillColorKey = keyof typeof HOVERED_FILL_COLORS;
type GapKey = keyof typeof GAPS;
type PaddingSize =
  | 0
  | 2
  | 4
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | 32
  | 36
  | 40
  | 48
  | 64;

interface ListItemProps {
  href: string;
  active?: boolean;
  icon?: string;
  children: React.ReactNode;

  gap?: GapKey;
  paddingInline?: PaddingSize;
  paddingBlock?: PaddingSize;

  activeBackgroundColor?: ColorKey;
  inactiveBackgroundColor?: ColorKey;

  activeTextColor?: TextColorKey;
  inactiveTextColor?: TextColorKey;

  activeHoverBackgroundColor?: HoverColorKey;
  inactiveHoverBackgroundColor?: HoverColorKey;

  activeHoverTextColor?: HoverTextColorKey;
  inactiveHoverTextColor?: HoverTextColorKey;

  activeIconColor?: FillColorKey;
  inactiveIconColor?: FillColorKey;

  activeHoverIconColor?: HoverFillColorKey;
  inactiveHoverIconColor?: HoverFillColorKey;
}

export default function ListItem({
  href,
  children,
  active = false,
  icon,
  gap = 4,
  paddingInline = 8,
  paddingBlock = 4,

  activeBackgroundColor = 'black',
  inactiveBackgroundColor = 'transparent',

  activeTextColor = 'white',
  inactiveTextColor = 'gray',

  activeHoverBackgroundColor = 'lightestGray',
  inactiveHoverBackgroundColor = 'lightestGray',

  activeHoverTextColor = 'black',
  inactiveHoverTextColor = 'black',

  activeIconColor = 'white',
  inactiveIconColor = 'gray',

  activeHoverIconColor = 'black',
  inactiveHoverIconColor = 'black',

  ...rest
}: Readonly<ListItemProps>) {
  const listStyles = [
    'list-style-type--none',
    'text-decoration-line--none',
    'border-radius--5',
    `padding-inline--${paddingInline}`,
    `padding-block--${paddingBlock}`,
    'display--block',

    // Only apply background color to the Link element
    active
      ? HOVERED_BACKGROUND_COLORS[activeHoverBackgroundColor]
      : HOVERED_BACKGROUND_COLORS[inactiveHoverBackgroundColor],

    active
      ? BACKGROUND_COLORS[activeBackgroundColor]
      : BACKGROUND_COLORS[inactiveBackgroundColor],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li {...rest}>
      <Link href={href} className={listStyles} prefetch>
        <Grid display='flex' alignItems='center' className={GAPS[gap]}>
          {icon && (
            <Icon
              name={icon}
              size={24}
              fill={active ? activeIconColor : inactiveIconColor}
              className={
                active
                  ? HOVERED_FILL_COLORS[activeHoverIconColor]
                  : HOVERED_FILL_COLORS[inactiveHoverIconColor]
              }
            />
          )}
          <Text
            size='small'
            weight='bold'
            inline
            className={[
              active
                ? TEXT_COLORS[activeTextColor]
                : TEXT_COLORS[inactiveTextColor],
              active
                ? HOVERED_TEXT_COLORS[activeHoverTextColor]
                : HOVERED_TEXT_COLORS[inactiveHoverTextColor],
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ paddingRight: 2 }}
          >
            {children}
          </Text>
        </Grid>
      </Link>
    </li>
  );
}
