/** @format */

import { getCityById } from '@/_actions/city/getCityById';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import Button from '@/_components/forms/Button';
import { getSports } from '@/_actions/sport/getSports';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getPlaceById } from '@/_actions/place/getPlaceById';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { extractSports } from '@/_helpers/extractSports';
import PlaceForm from '../_components/PlaceForm';

type PlaceDetailsPageParams = Readonly<{
  id?: string;
}>;

type PlaceDetailsPageProps = Readonly<{
  params?: Promise<PlaceDetailsPageParams> | PlaceDetailsPageParams;
}>;

function renderNotFound(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>Place unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.PLACES}>Back to places</Button>
      </Grid>
    </Main>
  );
}

export default async function PlaceDetailsPage({
  params,
}: PlaceDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const placeId = resolvedParams?.id;

  if (!placeId) {
    return renderNotFound('Missing place identifier in the URL.');
  }

  const place = await getPlaceById(placeId);

  if (!place) {
    return renderNotFound('We could not find this place.');
  }

  const cityId = place.cityID ?? place.cityId;
  const [countries, sportsResponse, initialCity] = await Promise.all([
    getAllCountries(),
    getSports({ page: 1, limit: 100 }),
    cityId ? getCityById(cityId) : Promise.resolve(null),
  ]);
  const normalizedSports = extractSports(sportsResponse.data);
  const sports =
    normalizedSports.length > 0
      ? normalizedSports
      : extractSports(sportsResponse as unknown);

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.PLACES} / ${place.name}`}
        icon='business'
      />
      <PlaceForm
        key={place.id}
        countries={countries}
        sports={sports}
        place={place}
        initialCity={initialCity}
        edit
      />
    </Grid>
  );
}
