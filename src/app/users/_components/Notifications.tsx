/** @format */

import Card from '@/_components/Card';
import SectionHeader from '@/_components/layout/SectionHeader';
import { User } from '@/_types/user';
import NotificationsForm from './forms/Notifications';

export default function Notifications({ user }: Readonly<{ user: User }>) {
  return (
    <Card>
      <SectionHeader title='Notifications' icon='send' />
      <NotificationsForm user={user} />
    </Card>
  );
}
