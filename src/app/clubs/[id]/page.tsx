/** @format */

import { getMe } from '@/_actions/auth/getMe';
import { getAdminClubById } from '@/_actions/club/getAdminClubById';
import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getGeoCountries } from '@/_actions/geo/getGeoCountries';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import ClubAdminShell from '../_components/ClubAdminShell';
import ClubForm from '../_components/ClubForm';
import DeleteClubButton from '../_components/DeleteClubButton';

type ClubPageParams = Readonly<{
  id?: string;
}>;

type ClubDetailsPageProps = Readonly<{
  params?: Promise<ClubPageParams> | ClubPageParams;
}>;

function renderUnavailable(username: string, title: string, message: string) {
  return (
    <ClubAdminShell username={username}>
      <Main>
        <Grid gap={16}>
          <Title size='large'>{title}</Title>
          <Text size='small' color='gray'>
            {message}
          </Text>
          <Button href={NAVIGATION.CLUBS}>Back to clubs</Button>
        </Grid>
      </Main>
    </ClubAdminShell>
  );
}

export default async function ClubDetailsPage({
  params,
}: ClubDetailsPageProps = {}) {
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const clubId = resolvedParams?.id;
  const user = await getMe();
  const username = user?.username ?? 'User';

  if (!clubId) {
    return renderUnavailable(
      username,
      'Club unavailable',
      'Missing club identifier in the URL.',
    );
  }

  const [clubResponse, countriesResponse] = await Promise.all([
    getAdminClubById(clubId),
    getGeoCountries(),
  ]);

  if (!clubResponse.data) {
    return renderUnavailable(
      username,
      'Club unavailable',
      resolveClubErrorMessage(clubResponse.error),
    );
  }

  const club = clubResponse.data;
  const selectedCountry = countriesResponse.data.find(
    country => country.id === club.countryId,
  );
  const citiesResponse = club.countryId
    ? await getGeoCitiesByCountry(club.countryId)
    : { data: [], error: undefined };
  const selectedCity = citiesResponse.data.find(city => city.id === club.cityId);

  return (
    <ClubAdminShell username={username}>
      <Grid gap={24}>
        <SectionHeader title={`${SECTIONS.CLUBS} / ${club.name}`} icon='club'>
          <Box display='flex' gap={4} alignItems='center'>
            <DeleteClubButton
              clubId={club.id}
              clubSlug={club.slug}
              clubName={club.name}
            />
            <Button href={NAVIGATION.CLUBS}>All clubs</Button>
          </Box>
        </SectionHeader>

        <ClubForm
          club={club}
          countries={countriesResponse.data}
          countriesError={countriesResponse.error?.error}
          initialCities={citiesResponse.data}
          selectedCountryLabel={selectedCountry?.name ?? club.countryId}
          selectedCityLabel={selectedCity?.name ?? club.cityId}
          edit
        />
      </Grid>
    </ClubAdminShell>
  );
}
