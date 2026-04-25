/** @format */

import React from 'react';
import {
  BACKGROUND_COLORS,
  BORDER_RADIUS,
  FILL_COLORS,
  HOVERED_BACKGROUND_COLORS,
  HOVERED_FILL_COLORS,
} from '@/_constants/box';
import {
  BOX_SHADOWS_COLORS,
  ButtonKind,
  ButtonVariant,
} from '@/_constants/button';
import { HOVERED_TEXT_COLORS, TEXT_COLORS } from '@/_constants/typography';
import { ICON_NAME } from '@/_constants/icons';
import Link, { LinkProps } from 'next/link';
import Grid from '../layout/Grid';
import Icon from '../Icon';
import Text from '../typography/Text';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  kind?: ButtonKind;
  rightIcon?: boolean;
  icon?: keyof typeof ICON_NAME;
  href?: LinkProps['href'];
  boxShadowColor?: keyof typeof BOX_SHADOWS_COLORS;
}

export default function Button({
  children,
  className = '',
  variant = 'solid',
  kind = 'primary',
  icon,
  href = '',
  rightIcon = false,
  ...rest
}: Readonly<ButtonProps>) {
  const isSolid = variant === 'solid';

  const classList = [
    'padding--0',
    'border--none',
    'border-width--0',
    'display--inline-block',
    'text-decoration-line--none',
    'outline--none',
    'cursor--pointer',
    BORDER_RADIUS[4],
    // apply reduced opacity when disabled
    rest.disabled ? 'opacity--02 cursor--not-allowed' : '',
    variant === 'solid'
      ? kind == 'primary'
        ? BACKGROUND_COLORS['black'] +
          ' ' +
          HOVERED_BACKGROUND_COLORS['darkGray']
        : kind == 'secondary'
          ? BACKGROUND_COLORS['gray'] +
            ' ' +
            HOVERED_BACKGROUND_COLORS['darkerBrown']
          : BACKGROUND_COLORS['lightestGray'] +
            ' ' +
            HOVERED_BACKGROUND_COLORS['lighterGray']
      : BACKGROUND_COLORS['transparent'],
    isSolid
      ? kind == 'primary'
        ? TEXT_COLORS['white']
        : kind == 'secondary'
          ? TEXT_COLORS['white']
          : TEXT_COLORS['darkestGray']
      : kind == 'primary'
        ? TEXT_COLORS['gray'] + ' ' + HOVERED_TEXT_COLORS['black']
        : kind == 'secondary'
          ? TEXT_COLORS['brown'] + ' ' + HOVERED_TEXT_COLORS['darkBrown']
          : TEXT_COLORS['darkestGray'] + ' ' + HOVERED_TEXT_COLORS['black'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconColorStyles = [
    variant === 'solid'
      ? kind == 'primary' || kind == 'secondary'
        ? FILL_COLORS['white']
        : FILL_COLORS['darkestGray']
      : kind == 'primary'
        ? FILL_COLORS['gray'] + ' ' + HOVERED_FILL_COLORS['black']
        : kind == 'secondary'
          ? FILL_COLORS['brown'] + ' ' + HOVERED_FILL_COLORS['darkerBrown']
          : FILL_COLORS['darkestGray'] + ' ' + HOVERED_FILL_COLORS['black'],
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <ButtonContent
      icon={icon}
      iconColorStyles={iconColorStyles}
      rightIcon={rightIcon}
    >
      {children}
    </ButtonContent>
  );

  if (href) {
    return (
      <Link href={href} className={classList}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classList} {...rest}>
      {content}
    </button>
  );
}

interface ButtonContentProps {
  children: React.ReactNode;
  icon?: keyof typeof ICON_NAME;
  iconColorStyles: string;
  rightIcon: boolean;
}

function ButtonContent({
  children,
  icon,
  iconColorStyles,
  rightIcon,
}: Readonly<ButtonContentProps>) {
  return (
    <Grid
      display='flex'
      gap={8}
      alignItems='center'
      className={`${
        icon === undefined
          ? 'padding-inline--16 padding-block--18'
          : 'padding-block--6 padding-left--10 padding-inline-end--16'
      } ${rightIcon ? 'flex-direction--row-reverse' : ''}`}
    >
      {icon ? (
        <Icon
          name={icon}
          size={24}
          className={iconColorStyles}
          display='block'
        />
      ) : null}
      <Text size='small' weight='bold' inline lineHeight='noLineHeight'>
        {children}
      </Text>
    </Grid>
  );
}
