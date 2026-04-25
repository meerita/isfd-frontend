/** @format */

import Dot from '../Dot';
import Icon from '../Icon';
import Text from '../typography/Text';
import { FILL_COLORS, IMAGE_SIZES } from '@/_constants/box';
import { iconName } from '@/_constants/icons';

export default function ListItemDataWithIcon({
  children,
  label,
  line = false,
  active = false,
  value,
  className,
  icon = 'description',
  iconFill = 'gray',
  iconSize = 24,
}: Readonly<{
  children?: React.ReactNode;
  line?: boolean;
  label: string;
  value?: React.ReactNode;
  active?: boolean;
  className?: string;
  icon?: iconName;
  iconFill?: keyof typeof FILL_COLORS;
  iconSize?: keyof typeof IMAGE_SIZES;
}>) {
  const listStyles = [
    'align-items--center',
    'display--flex',
    'gap--8',
    'padding-block--12',
    line && 'border-bottom-width--1',
    line && 'border-bottom-style--dotted',
    line && 'border-bottom-color--lightest-gray',
  ].join(' ');

  return (
    <li className={`${listStyles} ${className}`}>
      <Icon name={icon} size={iconSize} fill={iconFill} />
      <Text
        className='flex-grow--1 margin--0'
        color='darkGray'
        weight='semibold'
        size='small'
      >
        {label}
      </Text>
      {active ? <Dot active activeBackgroundColor='green' /> : null}
      {!active && children !== undefined && children !== null ? (
        typeof children === 'string' || typeof children === 'number' ? (
          <Text color='gray' size='small'>
            {children}
          </Text>
        ) : (
          children
        )
      ) : null}
      {value !== undefined && value !== null ? (
        typeof value === 'string' || typeof value === 'number' ? (
          <Text color='gray' size='small'>
            {value}
          </Text>
        ) : (
          value
        )
      ) : null}
    </li>
  );
}
