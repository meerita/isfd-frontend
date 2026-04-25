/** @format */

import TopBar from '@/_components/layout/TopBar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopBar username='Diego' />
      {children}
    </>
  );
}
