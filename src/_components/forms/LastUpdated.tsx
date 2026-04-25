/** @format */

import { MARGIN_VALUES, PADDING_VALUES } from '@/_constants/box';
import { TEXT_COLORS } from '@/_constants/typography';
import Text from '../typography/Text';
export interface LastUpdatedProps {
  date: Date;
  margin?: keyof typeof MARGIN_VALUES;
  padding?: keyof typeof PADDING_VALUES;
  color?: keyof typeof TEXT_COLORS;
  className?: string;
}

export default function LastUpdated({
  date,
  margin = 0,
  padding = 0,
  color = 'gray',
  className = '',
}: Readonly<LastUpdatedProps>) {
  const classList = [
    MARGIN_VALUES[margin],
    PADDING_VALUES[padding],
    TEXT_COLORS[color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Text size='tiny' color='lightGray' className={classList}>
      {`The last update was on ${new Date(date).toLocaleDateString(
        'es',
      )} at ${new Date(date).toLocaleTimeString('es')}.`}
    </Text>
  );
}
