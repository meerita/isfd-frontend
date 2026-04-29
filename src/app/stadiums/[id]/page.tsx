/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { getCityById } from '@/_actions/city/getCityById';
import { getAdminStadiumById } from '@/_actions/stadium/getAdminStadiumById';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import DeleteStadiumButton from '../_components/DeleteStadiumButton';
import StadiumForm from '../_components/StadiumForm';

type StadiumPageParams = Readonly<{
  id?: string;
}>;

type StadiumDetailsPageProps = Readonly<{
  params?: Promise<StadiumPageParams> | StadiumPageParams;
}>;

function renderUnavailable(title: string, message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>{title}</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.STADIUMS}>Back to stadiums</Button>
      </Grid>
    </Main>
  );
}

export default async function StadiumDetailsPage({
  params,
}: StadiumDetailsPageProps = {}) {
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const stadiumId = resolvedParams?.id;

  if (!stadiumId) {
    return renderUnavailable(
      'Stadium unavailable',
      'Missing stadium identifier in the URL.',
    );
  }

  const [stadiumResponse, countriesResponse] = await Promise.all([
    getAdminStadiumById(stadiumId),
    getAllCountries(),
  ]);

  if (!stadiumResponse.data) {
    return renderUnavailable(
      'Stadium unavailable',
      resolveStadiumErrorMessage(stadiumResponse.error),
    );
  }

  const stadium = stadiumResponse.data;
  const selectedCountry = countriesResponse.find(
    country => country.id === stadium.countryId,
  );
  const selectedCity = stadium.cityId ? await getCityById(stadium.cityId) : null;
  const initialProvinceName = selectedCity?.provinceName ?? null;
  const initialCities =
    stadium.countryId && initialProvinceName
      ? await getAdminCitiesByCountryIdAndProvince(
          stadium.countryId,
          initialProvinceName,
        )
      : [];

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.STADIUMS} / ${stadium.name}`}
        icon='stadiums'
      >
        <Box display='flex' gap={4} alignItems='center'>
          <DeleteStadiumButton stadiumId={stadium.id} stadiumName={stadium.name} />
          <Button href={NAVIGATION.STADIUMS}>All stadiums</Button>
        </Box>
      </SectionHeader>

      <StadiumForm
        stadium={stadium}
        countries={countriesResponse}
        initialProvinceName={initialProvinceName}
        initialCities={initialCities}
        countriesError={null}
        selectedCountryLabel={selectedCountry?.name ?? stadium.countryId}
        selectedCityLabel={selectedCity?.name ?? stadium.cityId}
        edit
      />
    </Grid>
  );
}
