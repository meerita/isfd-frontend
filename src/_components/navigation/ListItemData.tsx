/** @format */

import Dot from '../Dot';
import Text from '../typography/Text';

export default function ListItemData({
  children,
  label,
  line = false,
  active = false,
  value,
  className,
}: Readonly<{
  children?: React.ReactNode;
  line?: boolean;
  label: string;
  value?: React.ReactNode;
  active?: boolean;
  className?: string;
}>) {
  const listStyles = [
    'align-items--center',
    'display--flex',
    'gap--16',
    'padding-block--16',
    line && 'border-bottom-width--1',
    line && 'border-bottom-style--dotted',
    line && 'border-bottom-color--lightest-gray',
  ].join(' ');

  return (
    <li className={`${listStyles} ${className}`}>
      <Text
        className='flex-grow--1 margin--0'
        color='darkGray'
        weight='semibold'
        size='small'
      >
        {label}
      </Text>
      {active ? <Dot active activeBackgroundColor='black' /> : null}
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
