/** @format */

import TopBar from '@/_components/layout/TopBar';
import Grid from '@/_components/layout/Grid';

type ClubAdminShellProps = Readonly<{
  username?: string;
  children: React.ReactNode;
}>;

export default function ClubAdminShell({
  username = 'User',
  children,
}: ClubAdminShellProps) {
  return (
    <>
      <TopBar username={username} />
      <Grid padding={32} justifyItems='center'>
        <Grid gap={16} className='width--100 max-width--75'>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
