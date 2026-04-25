/** @format */

import { User } from '@/_types/user';
import PrivacyForm from './forms/Privacy';
import Card from '@/_components/Card';
import SectionHeader from '@/_components/layout/SectionHeader';

export default function Privacy({ user }: Readonly<{ user: User }>) {
  return (
    <Card>
      <SectionHeader title='Privacy settings' icon='visibility' />
      <PrivacyForm user={user} />
    </Card>
  );
}
