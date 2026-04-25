/** @format */

import generateStatus from '@/_helpers/generators/generate_status';
import Text from './typography/Text';
import { JSX } from 'react/jsx-dev-runtime';

export default function CurrentStatus(
  status: string | { status: string }
): JSX.Element {
  const statusString = typeof status === 'string' ? status : status.status;

  const currentStatus = generateStatus(statusString);

  return (
    <Text
      inline
      size='small'
      color={currentStatus.color}
      weight={currentStatus.accent ? 'bold' : 'semibold'}
    >
      {currentStatus.title}
    </Text>
  );
}
