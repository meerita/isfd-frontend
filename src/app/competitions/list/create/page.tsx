/** @format */

import { getAllCompetitionTypes } from '@/_actions/competitionType/getAllCompetitionTypes';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionForm from '../_components/CompetitionForm';

export default async function CreateCompetitionPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const [competitionTypes, federations, countries] = await Promise.all([
    getAllCompetitionTypes(),
    getAllFederations(),
    getAllCountries(),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS_LIST },
          { label: 'Create' },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>Create a new competition</Title>
      </Grid>
      <CompetitionForm
        competitionTypes={competitionTypes.map(item => ({ id: item.id, name: item.name }))}
        federations={federations.map(item => ({ id: item.id, name: item.name }))}
        countries={countries.map(item => ({ id: item.id, name: item.name }))}
      />
    </Grid>
  );
}
