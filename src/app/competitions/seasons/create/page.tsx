/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import SeasonForm from '../_components/SeasonForm';

export default async function CreateSeasonPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Seasons', href: NAVIGATION.COMPETITION_SEASONS },
          { label: 'Create' },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>Create a new season</Title>
      </Grid>
      <SeasonForm />
    </Grid>
  );
}
