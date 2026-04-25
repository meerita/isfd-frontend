/** @format */

// File: src/app/groups/layout.tsx
// Purpose: Provide the shared admin layout for the groups route
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Grid from '@/_components/layout/Grid';
import TopBar from '@/_components/layout/TopBar';

export default function GroupsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopBar username='Diego' />
      <Grid padding={32} justifyItems='center'>
        <Grid gap={16} className='width--100 max-width--75'>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
