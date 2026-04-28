/** @format */

import { getGeoCountries } from '@/_actions/geo/getGeoCountries';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

import FederationForm from '../../federations/_components/FederationForm';

export default async function CreateFederationPage() {
  const countriesResponse = await getGeoCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.FEDERATIONS} icon='admin' />
      <Grid gap={8}>
        <Title size='medium'>Create a new federation</Title>
      </Grid>
      <FederationForm
        countries={countriesResponse.data}
        countriesError={countriesResponse.error?.error}
      />
    </Grid>
  );
}
