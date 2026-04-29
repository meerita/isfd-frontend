/** @format */

import { getGeoCountries } from '@/_actions/geo/getGeoCountries';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import ClubForm from '../../clubs/_components/ClubForm';

export default async function CreateClubPage() {
  await requireAdminAccess();

  const countriesResponse = await getGeoCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.CLUBS} icon='club' />
      <Grid gap={8}>
        <Title size='medium'>Create a new club</Title>
      </Grid>
      <ClubForm
        countries={countriesResponse.data}
        countriesError={countriesResponse.error?.error}
      />
    </Grid>
  );
}
