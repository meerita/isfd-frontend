/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import BrandForm from '../../brands/_components/BrandForm';

export default async function CreateBrandPage() {
  await requireAdminAccess();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.BRANDS} icon='brand' />
      <Grid gap={8}>
        <Title size='medium'>Create a new brand</Title>
      </Grid>
      <BrandForm />
    </Grid>
  );
}
