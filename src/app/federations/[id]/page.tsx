/** @format */

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminFederationById } from '@/_actions/federation/getAdminFederationById';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';

import DeleteFederationButton from '../_components/DeleteFederationButton';
import FederationForm from '../_components/FederationForm';

type FederationPageParams = Readonly<{
  id?: string;
}>;

type FederationDetailsPageProps = Readonly<{
  params?: Promise<FederationPageParams> | FederationPageParams;
}>;

function renderUnavailable(title: string, message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>{title}</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.FEDERATIONS}>Back to federations</Button>
      </Grid>
    </Main>
  );
}

export default async function FederationDetailsPage({
  params,
}: FederationDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const federationId = resolvedParams?.id;

  if (!federationId) {
    return renderUnavailable(
      'Federation unavailable',
      'Missing federation identifier in the URL.',
    );
  }

  const federationResponse = await getAdminFederationById(federationId);
  if (!federationResponse.data) {
    if (federationResponse.error?.reason === 'FEDERATION_NOT_FOUND') {
      return renderUnavailable(
        'Federation unavailable',
        'We could not find this federation.',
      );
    }

    return renderUnavailable(
      'Federation unavailable',
      federationResponse.error?.error ||
        federationResponse.error?.message ||
        'We could not load this federation.',
    );
  }

  const federation = federationResponse.data;
  const countries = await getAllCountries();
  const selectedCountry = countries.find(
    country => country.id === federation.countryId,
  );
  const citiesResponse = federation.countryId
    ? await getGeoCitiesByCountry(federation.countryId)
    : { data: [], error: undefined };
  const selectedCity = citiesResponse.data.find(
    city => city.id === federation.cityId,
  );

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.FEDERATIONS} / ${federation.name}`}
        icon='admin'
      >
        <Box display='flex' gap={4} alignItems='center'>
          <DeleteFederationButton
            federationId={federation.id}
            federationName={federation.name}
          />
          <Button href={NAVIGATION.FEDERATIONS}>All federations</Button>
        </Box>
      </SectionHeader>

      <FederationForm
        federation={federation}
        countries={countries}
        initialCities={citiesResponse.data}
        selectedCountryLabel={selectedCountry?.name ?? federation.countryId}
        selectedCityLabel={selectedCity?.name ?? federation.cityId}
        edit
      />
    </Grid>
  );
}
