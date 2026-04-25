/** @format */

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import { User } from '@/_types/user';
import ChangePasswordForm from './forms/ChangePassword';
import ResetPassword from './forms/ResetPassword';

export default function Password({ user }: Readonly<{ user: User }>) {
  return (
    <Card>
      <SectionHeader title='Password management' icon='password' />
      <Grid gap={32} columns={2} alignItems='start'>
        <ChangePasswordForm />
        <ResetPassword />
      </Grid>
    </Card>
  );
}
