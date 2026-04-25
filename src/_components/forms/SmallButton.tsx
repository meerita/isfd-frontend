/** @format */

import Link, { LinkProps } from 'next/link';
import Icon from '../Icon';
import Grid from './layout/Grid';
import Text from './typography/Text';
import {
  BACKGROUND_COLORS,
  BORDER_RADIUS,
  FILL_COLORS,
  HOVERED_BACKGROUND_COLORS,
} from '@/_constants/box';
import { TEXT_COLORS } from '@/_constants/typography';
import { BOX_SHADOWS_COLORS } from '@/_constants/button';
import { ICON_NAME } from '@/_constants/icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  rightIcon?: boolean;
  iconColor?: keyof typeof FILL_COLORS;
  icon?: keyof typeof ICON_NAME;
  href?: LinkProps['href'];
  boxShadowColor?: keyof typeof BOX_SHADOWS_COLORS;
}

export default function SmallButton({
  children,
  className = '',
  icon,
  iconColor = 'darkGray',
  href = '',
  rightIcon = false,
  ...rest
}: Readonly<ButtonProps>) {
  const classList = [
    'padding--0',
    'c-smallbutton',
    'display--inline-block',
    'text-decoration-line--none',
    'outline--none',
    'cursor--pointer',
    BORDER_RADIUS[4],
    BACKGROUND_COLORS['white'] + ' ' + HOVERED_BACKGROUND_COLORS['almostWhite'],
    TEXT_COLORS['darkGray'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <ButtonContent icon={icon} iconColor={iconColor} rightIcon={rightIcon}>
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
  children?: React.ReactNode;
  icon?: keyof typeof ICON_NAME;
  iconColor: keyof typeof FILL_COLORS;
  rightIcon: boolean;
}

function ButtonContent({
  children,
  icon,
  iconColor,
  rightIcon,
}: Readonly<ButtonContentProps>) {
  const hasChildren = Boolean(children);

  const paddingClass = icon
    ? hasChildren
      ? rightIcon
        ? 'padding-block--8 padding-inline--8 padding-inline-start--12'
        : 'padding-block--8 padding-inline--8 padding-inline-end--12'
      : 'padding--8'
    : 'padding-inline--4 padding-block--8';

  return (
    <Grid
      display='flex'
      gap={hasChildren ? 8 : 0}
      alignItems='center'
      className={`${paddingClass} ${
        rightIcon ? 'flex-direction--row-reverse' : ''
      }`}
    >
      {icon && <Icon name={icon} size={16} display='block' fill={iconColor} />}
      {hasChildren && (
        <Text size='tiny' weight='semibold' inline lineHeight='noLineHeight'>
          {children}
        </Text>
      )}
    </Grid>
  );
}
