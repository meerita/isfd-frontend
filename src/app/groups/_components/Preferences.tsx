/** @format */

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import type { Group } from '@/_types/group';
import PreferencesForm from './forms/Preferences';

export default function Preferences({ group }: Readonly<{ group: Group }>) {
  return (
    <Grid gap={16}>
      <Card className='display--grid gap--16'>
        <SectionHeader title='Preferences' icon='settings' />
        <PreferencesForm group={group} />
      </Card>
    </Grid>
  );
}
