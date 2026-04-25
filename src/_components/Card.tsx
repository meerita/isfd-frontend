/** @format */

import Grid from './layout/Grid';

export default function Card({
  padding = 32,
  children,
  elevation = 2,
  className = '',
  rest,
}: Readonly<{
  padding?: number;
  children: React.ReactNode;
  elevation?: number;
  className?: string;
  rest?: React.HTMLAttributes<HTMLDivElement>;
}>) {
  return (
    <Grid
      gap={32}
      {...rest}
      className={`background-color--white elevation--${elevation} border-radius--8 padding--${padding} padding-top--${
        padding - 12
      } ${className}`}
    >
      {children}
    </Grid>
  );
}
