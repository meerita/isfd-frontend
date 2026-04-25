/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getSports } from '@/_actions/sport/getSports';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { extractSports } from '@/_helpers/extractSports';
import SECTIONS from '@/_constants/sections';

import PlaceForm from '../../places/_components/PlaceForm';

export default async function CreatePlacePage() {
  const [countries, sportsResponse] = await Promise.all([
    getAllCountries(),
    getSports({ page: 1, limit: 100 }),
  ]);
  const normalizedSports = extractSports(sportsResponse.data);
  const sports =
    normalizedSports.length > 0
      ? normalizedSports
      : extractSports(sportsResponse as unknown);

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.PLACES} icon='business' />
      <Grid gap={8}>
        <Title size='medium'>Create a new place</Title>
        <Text size='small' color='gray'>
          Choose the exact city through the dependent location selectors. That
          selection will populate the `cityId` used by the API.
        </Text>
      </Grid>
      <PlaceForm countries={countries} sports={sports} />
    </Grid>
  );
}
