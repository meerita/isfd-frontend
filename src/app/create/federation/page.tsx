/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

import FederationForm from '../../federations/_components/FederationForm';

export default async function CreateFederationPage() {
  const countries = await getAllCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.FEDERATIONS} icon='admin' />
      <Grid gap={8}>
        <Title size='medium'>Create a new federation</Title>
      </Grid>
      <FederationForm countries={countries} />
    </Grid>
  );
}
