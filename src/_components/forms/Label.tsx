/** @format */

import Box from '../layout/Box';
import Text from '../typography/Text';

export default function Label({
  label,
  error = false,
  errors,
  helperText,
  children,
  className,
}: Readonly<{
  label?: string; // Made label optional
  line?: boolean;
  error?: boolean;
  errors?: boolean;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}>) {
  const hasError = error || errors;

  return (
    <label className={className}>
      <Box display='grid' gap={4}>
        {label && (
          <Text
            size='small'
            weight='bold'
            color='black'
            className='margin--0 white-space--nowrap'
          >
            {label}:
          </Text>
        )}
        {children}
        {helperText ? (
          <Text
            size='small'
            color={hasError ? 'red' : 'gray'}
            className='margin--0 font-weight--500'
          >
            {helperText}
          </Text>
        ) : null}
      </Box>
    </label>
  );
}
