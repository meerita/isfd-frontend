/** @format */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getSportById } from '@/_actions/sport/getSportById';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';

import SportForm from '../_components/SportForm';

type SportPageParams = Readonly<{
  id?: string;
}>;

type SportDetailsPageProps = Readonly<{
  params?: Promise<SportPageParams> | SportPageParams;
}>;

function renderNotFound(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>Sport unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.SPORTS}>Back to sports</Button>
      </Grid>
    </Main>
  );
}

export default async function SportDetailsPage({
  params,
}: SportDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const sportId = resolvedParams?.id;

  if (!sportId) {
    return renderNotFound('Missing sport identifier in the URL.');
  }

  const sport = await getSportById(sportId);

  if (!sport) {
    return renderNotFound('We could not find this sport.');
  }

  return (
    <Grid gap={24}>
      <SectionHeader
        title={`${SECTIONS.SPORTS} / ${sport.name}`}
        icon='sports'
      />
      <SportForm key={sport.id} sport={sport} edit />
    </Grid>
  );
}
