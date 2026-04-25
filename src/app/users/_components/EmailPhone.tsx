/** @format */

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import ChangeEmailForm from './forms/Email';
import ChangePhoneForm from './forms/ChangePhone';
import type { User } from '@/_types/user';

export default function EmailPhone({ user }: Readonly<{ user: User }>) {
  return (
    <Card className='display--grid gap--32'>
      <SectionHeader title='Email & Phone' icon='mail' />
      <Grid gap={32} columns={2}>
        <ChangeEmailForm user={user} />
        <ChangePhoneForm user={user} />
      </Grid>
    </Card>
  );
}
