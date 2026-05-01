/** @format */

'use client';

import { useI18n } from '@/_i18n/I18nProvider';
import PersonSectionPlaceholder from './PersonSectionPlaceholder';

export default function PersonGamesSection(): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <PersonSectionPlaceholder
      title={dictionary.persons.detail.games}
      description={dictionary.persons.detail.sectionsPending}
    />
  );
}
