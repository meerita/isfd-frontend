/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import PersonForm from '../../persons/_components/PersonForm';

export default async function CreatePersonPage() {
  await requireAdminAccess();

  const countries = await getAllCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.PERSONS} icon='person' />
      <Grid gap={8}>
        <Title size='medium'>Create a new person</Title>
      </Grid>
      <PersonForm countries={countries} />
    </Grid>
  );
}
