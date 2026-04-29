/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import StadiumForm from '../../stadiums/_components/StadiumForm';

export default async function CreateStadiumPage() {
  await requireAdminAccess();

  const countries = await getAllCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.STADIUMS} icon='stadiums' />
      <Grid gap={8}>
        <Title size='medium'>Create a new stadium</Title>
      </Grid>
      <StadiumForm countries={countries} />
    </Grid>
  );
}
