/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

import CountryForm from '../../countries/_components/CountryForm';

export default async function CreateCountryPage() {
  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.COUNTRIES} icon='countries' />
      <Grid gap={8}>
        <Title size='medium'>Create a new country</Title>
      </Grid>
      <CountryForm />
    </Grid>
  );
}
