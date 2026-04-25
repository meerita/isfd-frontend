/** @format */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getEventById } from '@/_actions/event/getEventById';
import { getGroups } from '@/_actions/group/getGroups';
import { getPlaceById } from '@/_actions/place/getPlaceById';
import { getSports } from '@/_actions/sport/getSports';
import { getCityById } from '@/_actions/city/getCityById';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { extractGroups } from '@/_helpers/extractGroups';
import { extractSports } from '@/_helpers/extractSports';

import DeleteEventButton from '../_components/DeleteEventButton';
import EventForm from '../_components/EventForm';

type EventDetailsPageParams = Readonly<{
  id?: string;
}>;

type EventDetailsPageProps = Readonly<{
  params?: Promise<EventDetailsPageParams> | EventDetailsPageParams;
}>;

function renderNotFound(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>Event unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.EVENTS}>Back to events</Button>
      </Grid>
    </Main>
  );
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams?.id;

  if (!eventId) {
    return renderNotFound('Missing event identifier in the URL.');
  }

  const event = await getEventById(eventId);

  if (!event) {
    return renderNotFound('We could not find this event.');
  }

  const placeId =
    event.placeId ||
    (typeof event.place === 'object' && event.place !== null
      ? event.place.id
      : undefined);
  const [countries, sportsResponse, groupsResponse, initialPlace] =
    await Promise.all([
      getAllCountries(),
      getSports({ page: 1, limit: 100 }),
      getGroups({ page: 1, limit: 100 }),
      placeId ? getPlaceById(placeId) : Promise.resolve(null),
    ]);
  const sports = extractSports(sportsResponse.data);
  const groups = extractGroups(groupsResponse.data);
  const initialCity = initialPlace
    ? await getCityById(initialPlace.cityID ?? initialPlace.cityId ?? '')
    : null;

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.EVENTS} / ${event.title}`} icon='eventList'>
        <DeleteEventButton eventId={event.id} eventTitle={event.title} />
      </SectionHeader>
      <EventForm
        key={event.id}
        countries={countries}
        sports={sports}
        groups={groups}
        event={event}
        initialCity={initialCity}
        initialPlace={initialPlace}
        edit
      />
    </Grid>
  );
}
