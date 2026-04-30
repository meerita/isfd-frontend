/** @format */

import { getMe } from '@/_actions/auth/getMe';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminPersonById } from '@/_actions/person/getAdminPersonById';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import ClubAdminShell from '../../clubs/_components/ClubAdminShell';
import DeletePersonButton from '../_components/DeletePersonButton';
import PersonForm from '../_components/PersonForm';

type PersonPageParams = Readonly<{
  id?: string;
}>;

type PersonDetailsPageProps = Readonly<{
  params?: Promise<PersonPageParams> | PersonPageParams;
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
          <Button href={NAVIGATION.PERSONS}>Back to persons</Button>
        </Grid>
      </Main>
    </ClubAdminShell>
  );
}

export default async function PersonDetailsPage({
  params,
}: PersonDetailsPageProps = {}) {
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const personId = resolvedParams?.id;
  const user = await getMe();
  const username = user?.username ?? 'User';

  if (!personId) {
    return renderUnavailable(
      username,
      'Person unavailable',
      'Missing person identifier in the URL.',
    );
  }

  const [personResponse, countriesResponse] = await Promise.all([
    getAdminPersonById(personId),
    getAllCountries(),
  ]);

  if (!personResponse.data) {
    return renderUnavailable(
      username,
      'Person unavailable',
      resolvePersonErrorMessage(personResponse.error),
    );
  }

  const person = personResponse.data;
  const selectedCountry = countriesResponse.find(
    country => country.id === person.primaryNationalityCountryId,
  );

  return (
    <ClubAdminShell username={username}>
      <Grid gap={24}>
        <SectionHeader title={`${SECTIONS.PERSONS} / ${person.fullName}`} icon='person'>
          <Box display='flex' gap={4} alignItems='center'>
            <DeletePersonButton
              personId={person.id}
              personName={person.fullName}
            />
            <Button href={NAVIGATION.PERSONS}>All persons</Button>
          </Box>
        </SectionHeader>

        <PersonForm
          person={person}
          countries={countriesResponse}
          selectedPrimaryNationalityCountryLabel={
            selectedCountry?.name ?? person.primaryNationalityCountryId
          }
          edit
        />
      </Grid>
    </ClubAdminShell>
  );
}
