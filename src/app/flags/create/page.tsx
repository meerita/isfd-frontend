/** @format */

import CreateFeatureFlagForm from '@/_components/flags/CreateFeatureFlagForm';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';

export default function CreateFlagPage() {
  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.FLAGS} icon='flagChecked' />
      <Grid gap={8}>
        <Title size='medium'>Create a new feature flag</Title>
        <Text size='small' color='gray'>
          Define the flag metadata and the primary targeting rule used by the
          admin API.
        </Text>
      </Grid>
      <CreateFeatureFlagForm />
    </Grid>
  );
}
