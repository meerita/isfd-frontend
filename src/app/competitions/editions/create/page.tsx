/** @format */

import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAllCompetitionPyramids } from '@/_actions/competitionStructure/getAllCompetitionPyramids';
import { getAllCompetitionTiers } from '@/_actions/competitionStructure/getAllCompetitionTiers';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionEditionForm from '../_components/CompetitionEditionForm';

export default async function CreateCompetitionEditionPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [competitions, competitionPyramids, competitionTiers] = await Promise.all([
    getAllCompetitions(),
    getAllCompetitionPyramids(),
    getAllCompetitionTiers(),
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
        competitions={competitions.map(item => ({ id: item.id, name: item.name }))}
        competitionPyramids={competitionPyramids.map(item => ({
          id: item.id,
          name: item.name,
        }))}
        competitionTiers={competitionTiers.map(item => ({ id: item.id, name: item.name }))}
      />
    </Grid>
  );
}
