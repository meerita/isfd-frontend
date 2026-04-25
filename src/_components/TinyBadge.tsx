/** @format */

import Text from './typography/Text';

interface TinyBadgeProps {
  label: string;
  className?: string;
}

export default function TinyBadge({
  label,
  className = '',
}: Readonly<TinyBadgeProps>) {
  return (
    <Text
      inline
      className={`font-family--monospace text-transform--uppercase background-color--black color--white padding-inline--10 padding-block--4 margin--0 border-radius--5 font-size--8 ${className}`}
    >
      {label}
    </Text>
  );
}
