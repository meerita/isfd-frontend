/** @format */

import React from 'react';
import Text from '../typography/Text';
import Box from '../layout/Box';
import Icon from '../Icon';
import { ICON_NAME } from '@/_constants/icons';
import { FILL_COLORS } from '@/_constants/box';
import { FontWeight } from '@/_constants/typography';

export default function Cell({
  children,
  className = '',
  align = 'left',
  header = false,
  active = true,
  icon,
  iconFill = 'darkGray' as keyof typeof FILL_COLORS,
  iconTitle,
  weight = 'bold' as FontWeight,
  title,
}: Readonly<{
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  header?: boolean;
  active?: boolean;
  icon?: keyof typeof ICON_NAME;
  iconFill?: keyof typeof FILL_COLORS;
  iconTitle?: string;
  weight?: FontWeight;
  title?: string;
}>) {
  const alignment = `text-align--${align}`;
  const ElementType = header ? 'th' : 'td';

  const color = header ? 'black' : 'gray';
  const shouldWrapInText =
    typeof children === 'string' || typeof children === 'number';

  const onlyIcon = icon && !children;
  const iconClass = onlyIcon ? 'display--inline-block' : '';

  return (
    <ElementType
      title={title}
      className={`padding-block--12 border-bottom-width--1 border-bottom-style--solid ${
        header
          ? 'border-bottom-color--lightest-gray'
          : 'border-bottom-color--almost-white'
      } ${alignment} ${className} ${active ? '' : 'color--lightest-gray'}`}
    >
      {icon && children ? (
        <Box display='flex' gap={8} alignItems='center'>
          <Icon name={icon} fill={iconFill} size={24} title={iconTitle} />
          <Text inline size='small' color={color} weight={weight}>
            {children}
          </Text>
        </Box>
      ) : children && shouldWrapInText ? (
        <Text inline size='small' color={color} weight={weight}>
          {children}
        </Text>
      ) : children ? (
        children
      ) : icon ? (
        <Icon
          name={icon}
          fill={iconFill}
          size={24}
          className={iconClass}
          title={iconTitle}
        />
      ) : null}
    </ElementType>
  );
}
