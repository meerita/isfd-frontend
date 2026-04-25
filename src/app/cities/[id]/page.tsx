/** @format */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getCityById } from '@/_actions/city/getCityById';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';

import CityForm from '../_components/CityForm';
import DeleteCityButton from '../_components/DeleteCityButton';

type CityPageParams = Readonly<{
  id?: string;
}>;

type CityDetailsPageProps = Readonly<{
  params?: Promise<CityPageParams> | CityPageParams;
}>;

function renderNotFound(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>City unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.CITIES}>Back to cities</Button>
      </Grid>
    </Main>
  );
}

export default async function CityDetailsPage({
  params,
}: CityDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const cityId = resolvedParams?.id;

  if (!cityId) {
    return renderNotFound('Missing city identifier in the URL.');
  }

  const [city, countries] = await Promise.all([
    getCityById(cityId),
    getAllCountries(),
  ]);

  if (!city) {
    return renderNotFound('We could not find this city.');
  }

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.CITIES} / ${city.name}`} icon='cities'>
        <DeleteCityButton cityId={city.id} cityName={city.name} />
      </SectionHeader>
      <CityForm key={city.id} city={city} countries={countries} edit />
    </Grid>
  );
}
