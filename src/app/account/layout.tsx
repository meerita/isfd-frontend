/** @format */

import { getMe } from '@/_actions/auth/getMe';
import Grid from '@/_components/layout/Grid';
import TopBar from '@/_components/layout/TopBar';

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await getMe();

  return (
    <>
      <TopBar username={user?.username ?? 'User'} />
      <Grid padding={32} justifyItems='center'>
        <Grid gap={16} className='width--100 max-width--75'>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
