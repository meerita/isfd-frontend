/** @format */

import { User } from '@/_types/user';
import PreferencesForm from './forms/Preference';
import Card from '@/_components/Card';
import SectionHeader from '@/_components/layout/SectionHeader';

export default function Preferences({ user }: Readonly<{ user: User }>) {
  return (
    <Card className='display--grid gap--16'>
      <SectionHeader title='Preferences' icon='settings' />
      <PreferencesForm user={user} />
    </Card>
  );
}
