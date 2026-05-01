/** @format */

'use client';

import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { useI18n } from '@/_i18n/I18nProvider';
import type { FederationSection } from './FederationInformationTab';

type FederationSectionPlaceholderProps = Readonly<{
  section: Exclude<FederationSection, 'profile'>;
}>;

export default function FederationSectionPlaceholder({
  section,
}: FederationSectionPlaceholderProps): React.JSX.Element {
  const { dictionary } = useI18n();

  const sectionLabels: Record<Exclude<FederationSection, 'profile'>, string> = {
    media: dictionary.federations.detail.media,
    teams: dictionary.federations.detail.teams,
    championships: dictionary.federations.detail.championships,
  };

  return (
    <Card>
      <Grid gap={16}>
        <SectionHeader title={sectionLabels[section]} />
        <Text color='gray' size='small'>
          {dictionary.federations.detail.sectionsPending}
        </Text>
      </Grid>
    </Card>
  );
}
