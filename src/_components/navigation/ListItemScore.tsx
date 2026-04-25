/** @format */

import DifficultyScore from '../DifficultyScore';
import Box from '../layout/Box';
import Text from '../typography/Text';

export default function ListItemScore({
  label,
  line = false,
  value,
  title,
  className,
}: Readonly<{
  line?: boolean;
  label: string;
  value: number;
  title?: string;
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
      <Box style={{ width: '30%' }}>
        <DifficultyScore percentage={value} title={title} />
      </Box>
    </li>
  );
}
