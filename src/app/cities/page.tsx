/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import { getAllCountries } from '@/_actions/country/getAllCountries';

import CityForm from './_components/CityForm';

export default async function CitiesPage() {
  const countries = await getAllCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities' />
      <Grid gap={8}>
        <Title size='medium'>Create a new city</Title>
        <Text size='small' color='gray'>
          Provide at least a name, country, and continent. You can always edit
          the city later from its detail page.
        </Text>
      </Grid>
      <CityForm countries={countries} />
    </Grid>
  );
}
