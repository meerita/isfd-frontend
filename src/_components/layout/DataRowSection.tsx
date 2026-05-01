/** @format */

import Title from '../typography/Title';
import Box from './Box';

export default function DataRowSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <Box display='grid' gap={16}>
      <Title size='tiny'>{title}</Title>
      {children}
    </Box>
  );
}
