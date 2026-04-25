/** @format */

import { GAPS } from '@/_constants/box';
import Grid from '../layout/Grid';
import Nav from './Nav';

export default function ButtonGroup({
  children,
  border = false,
  gap,
  className = '',
}: Readonly<{
  children: React.ReactNode;
  border?: boolean;
  gap?: keyof typeof GAPS;
  className?: string;
}>) {
  return (
    <Nav border={border} className={className}>
      <Grid display='flex' gap={gap}>
        {children}
      </Grid>
    </Nav>
  );
}
