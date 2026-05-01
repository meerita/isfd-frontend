/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionTypeForm from '../_components/CompetitionTypeForm';

export default async function CreateCompetitionTypePage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Types', href: NAVIGATION.COMPETITION_TYPES },
          { label: 'Create' },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>Create a new competition type</Title>
      </Grid>
      <CompetitionTypeForm />
    </Grid>
  );
}
