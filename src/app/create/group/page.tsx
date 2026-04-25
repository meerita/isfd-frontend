/** @format */

// File: src/app/create/group/page.tsx
// Purpose: Render the create group page with all dependent form catalogs
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getSports } from '@/_actions/sport/getSports';
import SECTIONS from '@/_constants/sections';
import { extractSports } from '@/_helpers/extractSports';

import GroupForm from '../../groups/_components/GroupForm';

export default async function CreateGroupPage() {
  const [countries, sportsResponse] = await Promise.all([
    getAllCountries(),
    getSports({ page: 1, limit: 100 }),
  ]);
  const normalizedSports = extractSports(sportsResponse.data);
  const sports =
    normalizedSports.length > 0
      ? normalizedSports
      : extractSports(sportsResponse as unknown);

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.GROUPS} icon='group' />
      <Grid gap={8}>
        <Title size='medium'>Create a new group</Title>
        <Text size='small' color='gray'>
          Choose the province and then the city through the dependent location
          selectors. The group location will be created from that selected city.
        </Text>
      </Grid>
      <GroupForm countries={countries} sports={sports} />
    </Grid>
  );
}
