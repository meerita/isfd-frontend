/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getGroups } from '@/_actions/group/getGroups';
import { getSports } from '@/_actions/sport/getSports';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import { extractGroups } from '@/_helpers/extractGroups';
import { extractSports } from '@/_helpers/extractSports';

import EventForm from '../../events/_components/EventForm';

export default async function CreateEventPage() {
  const [countries, sportsResponse, groupsResponse] = await Promise.all([
    getAllCountries(),
    getSports({ page: 1, limit: 100 }),
    getGroups({ page: 1, limit: 100 }),
  ]);
  const sports = extractSports(sportsResponse.data);
  const groups = extractGroups(groupsResponse.data);

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.EVENTS} icon='eventList' />
      <Grid gap={8}>
        <Title size='medium'>Create Event</Title>
        <Text size='small' color='gray'>
          Pick the exact place through the dependent location selectors and link
          the event to a group and sport catalog entry.
        </Text>
      </Grid>
      <EventForm countries={countries} sports={sports} groups={groups} />
    </Grid>
  );
}
