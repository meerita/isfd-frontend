/** @format */

import { getCompetitionBaseCatalogs } from '@/_actions/competition/getCompetitionCatalogs';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import {
  mapCompetitionSelectOptions,
  mapCompetitionTypeOptions,
} from '../_lib/competitionAdmin';
import CompetitionForm from '../_components/CompetitionForm';

export default async function CreateCompetitionPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const {
    competitionTypes,
    federations,
    countries,
    error,
  } = await getCompetitionBaseCatalogs();

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
        competitionTypes={mapCompetitionTypeOptions(competitionTypes)}
        federations={mapCompetitionSelectOptions(federations)}
        countries={mapCompetitionSelectOptions(countries)}
        catalogError={error}
      />
    </Grid>
  );
}
