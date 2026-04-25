/** @format */

import { getMe } from '@/_actions/auth/getMe';
import TopBar from '@/_components/layout/TopBar';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getMe();

  return (
    <>
      <TopBar username={user?.username ?? 'User'} />
      {children}
    </>
  );
}
