/** @format */

'use client';

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { useI18n } from '@/_i18n/I18nProvider';
import type { ClubSection } from './ClubInformationTab';

type ClubSectionPlaceholderProps = Readonly<{
  section: Exclude<ClubSection, 'profile'>;
}>;

export default function ClubSectionPlaceholder({
  section,
}: ClubSectionPlaceholderProps): React.JSX.Element {
  const { dictionary } = useI18n();

  const sectionLabels: Record<Exclude<ClubSection, 'profile'>, string> = {
    media: dictionary.clubs.detail.media,
    persons: dictionary.clubs.detail.persons,
    championships: dictionary.clubs.detail.championships,
    games: dictionary.clubs.detail.games,
    achievements: dictionary.clubs.detail.achievements,
  };

  return (
    <Card>
      <Grid gap={16}>
        <SectionHeader title={sectionLabels[section]} />
        <Text color='gray' size='small'>
          {dictionary.clubs.detail.sectionsPending}
        </Text>
      </Grid>
    </Card>
  );
}
