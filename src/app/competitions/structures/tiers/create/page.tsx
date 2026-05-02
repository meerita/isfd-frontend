/** @format */

import { getAllCompetitionPyramids } from '@/_actions/competitionStructure/getAllCompetitionPyramids';
import { getAllCompetitionTiers } from '@/_actions/competitionStructure/getAllCompetitionTiers';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionTierForm from '../_components/CompetitionTierForm';

export default async function CreateCompetitionTierPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [competitionPyramids, competitionTiers] = await Promise.all([
    getAllCompetitionPyramids(),
    getAllCompetitionTiers(),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competition Tiers', href: NAVIGATION.COMPETITION_TIERS },
          { label: 'Create' },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>Create a new competition tier</Title>
      </Grid>
      <CompetitionTierForm
        competitionPyramids={competitionPyramids.map(item => ({
          id: item.id,
          name: item.name,
        }))}
        competitionTiers={competitionTiers.map(item => ({
          id: item.id,
          competitionPyramidId: item.competitionPyramidId,
          name: item.name,
        }))}
      />
    </Grid>
  );
}
