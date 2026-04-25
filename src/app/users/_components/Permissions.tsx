/** @format */
import Card from '@/_components/Card';
import PermissionsForm from './forms/Permissions';
import SectionHeader from '@/_components/layout/SectionHeader';
import { User } from '@/_types/user';

export default function Permissions({ user }: Readonly<{ user: User }>) {
  return (
    <Card>
      <SectionHeader title='Permissions' icon='access' />
      <PermissionsForm user={user} />
    </Card>
  );
}
