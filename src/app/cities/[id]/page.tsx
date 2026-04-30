/** @format */

import Box from '@/_components/layout/Box';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getAdminCityById } from '@/_actions/city/getCityById';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CityActivationToggle from '../_components/CityActivationToggle';
import DeleteCityButton from '../_components/DeleteCityButton';
import CityForm from '../_components/CityForm';

type CityPageParams = Readonly<{
  id?: string;
}>;

type CityDetailsPageProps = Readonly<{
  params?: Promise<CityPageParams> | CityPageParams;
}>;

function renderUnavailable(message: string) {
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
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const cityId = resolvedParams?.id;

  if (!cityId) {
    return renderUnavailable('Missing city identifier in the URL.');
  }

  const cityResponse = await getAdminCityById(cityId);

  if (!cityResponse.data) {
    return renderUnavailable(resolveCityErrorMessage(cityResponse.error));
  }

  const city = cityResponse.data;
  const [countries, initialProvinces] = await Promise.all([
    getAllCountries(),
    getAdminProvincesByCountryId(city.countryId),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.CITIES} / ${city.name}`} icon='cities'>
        <Box display='flex' gap={4} alignItems='center'>
          <DeleteCityButton
            cityId={city.id}
            cityName={city.name}
            countryId={city.countryId}
          />
          <CityActivationToggle cityId={city.id} isActive={city.isActive} />
        </Box>
      </SectionHeader>
      <CityForm
        key={city.id}
        city={city}
        countries={countries}
        initialCountryLabel={city.countryName}
        initialProvinces={initialProvinces}
        edit
      />
    </Grid>
  );
}
