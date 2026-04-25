/** @format */

import { redirect } from 'next/navigation';

import { getFeatureFlagById } from '@/_actions/flags/getFeatureFlagById';
import EditFeatureFlagForm from '@/_components/flags/EditFeatureFlagForm';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import SectionHeader from '@/_components/layout/SectionHeader';
import SECTIONS from '@/_constants/sections';

type EditFlagPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditFlagPage({ params }: EditFlagPageProps) {
  const { id } = await params;
  const flag = await getFeatureFlagById(id);

  if (!flag) {
    redirect(NAVIGATION.FLAGS);
  }

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.FLAGS} / ${flag.key}`} icon='edit' />
      <EditFeatureFlagForm key={flag.id} flag={flag} />
    </Grid>
  );
}
