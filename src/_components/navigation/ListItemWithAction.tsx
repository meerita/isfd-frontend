/** @format */
import Text from '../typography/Text';
import Icon from '../Icon';
import { ICON_NAME, iconName } from '@/_constants/icons';

export default function ListItemWithAction({
  children,
  label,
  line = false,
  active = false,
  value,
  className = '',
  action,
  actionIcon = ICON_NAME.remove,
  actionTitle,
}: Readonly<{
  children?: React.ReactNode;
  line?: boolean;
  label: string;
  value?: string | number;
  active?: boolean;
  className?: string;
  action?: () => void;
  actionIcon?: iconName;
  actionTitle?: string;
}>) {
  const listStyles = [
    'align-items--center',
    'display--flex',
    'gap--16',
    'padding-block--12',
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
      <button
        type='button'
        onClick={action}
        className='border-width--0 background-color--transparent margin--0 padding--0 cursor--pointer outline-style--none'
      >
        <Icon name={actionIcon} title={actionTitle || 'action'} />
      </button>
    </li>
  );
}
