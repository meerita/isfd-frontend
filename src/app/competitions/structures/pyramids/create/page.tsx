/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { getDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionPyramidForm from '../_components/CompetitionPyramidForm';

export default async function CreateCompetitionPyramidPage(): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [countries, federations] = await Promise.all([
    getAllCountries(),
    getAllFederations(),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[
          { label: dictionary.competitions.title, href: NAVIGATION.COMPETITIONS },
          {
            label: dictionary.competitions.pyramids.title,
            href: NAVIGATION.COMPETITION_PYRAMIDS,
          },
          { label: dictionary.competitions.pyramids.createAction },
        ]}
        icon='trophy'
      />
      <Grid gap={8}>
        <Title size='medium'>{dictionary.competitions.pyramids.createTitle}</Title>
      </Grid>
      <CompetitionPyramidForm
        countries={countries.map(item => ({ id: item.id, name: item.name }))}
        federations={federations.map(item => ({ id: item.id, name: item.name }))}
      />
    </Grid>
  );
}
