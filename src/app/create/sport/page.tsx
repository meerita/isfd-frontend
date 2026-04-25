/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

import SportForm from '../../sports/_components/SportForm';

export default async function CreateSportPage() {
  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.SPORTS} icon='sports' />
      <Grid gap={8}>
        <Title size='medium'>Create a new sport</Title>
      </Grid>
      <SportForm />
    </Grid>
  );
}
