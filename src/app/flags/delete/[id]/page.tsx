/** @format */

import { redirect } from 'next/navigation';

import { getFeatureFlagById } from '@/_actions/flags/getFeatureFlagById';
import DeleteFeatureFlagForm from '@/_components/flags/DeleteFeatureFlagForm';
import Main from '@/_components/layout/Main';
import NAVIGATION from '@/_constants/navigation';
import SectionHeader from '@/_components/layout/SectionHeader';

type DeleteFlagPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function DeleteFlagPage({ params }: DeleteFlagPageProps) {
  const { id } = await params;
  const flag = await getFeatureFlagById(id);

  if (!flag) {
    redirect(NAVIGATION.FLAGS);
  }

  return (
    <>
      <SectionHeader title={`Delete ${flag.key}`} icon='remove' />
      <Main>
        <DeleteFeatureFlagForm flag={flag} />
      </Main>
    </>
  );
}
