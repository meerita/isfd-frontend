/** @format */

import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAllSeasons } from '@/_actions/season/getAllSeasons';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionEditionForm from '../_components/CompetitionEditionForm';

export default async function CreateCompetitionEditionPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [seasons, competitions] = await Promise.all([
    getAllSeasons(),
    getAllCompetitions(),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Editions', href: NAVIGATION.COMPETITION_EDITIONS },
          { label: 'Create' },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>Create a new competition edition</Title>
      </Grid>
      <CompetitionEditionForm
        seasons={seasons.map(item => ({ id: item.id, name: item.name }))}
        competitions={competitions.map(item => ({ id: item.id, name: item.name }))}
      />
    </Grid>
  );
}
