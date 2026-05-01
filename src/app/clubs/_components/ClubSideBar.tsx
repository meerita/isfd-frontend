/** @format */

'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { ClubSection } from './ClubInformationTab';

type ClubSidebarNavigationProps = Readonly<{
  clubId: string;
  activeSection: ClubSection;
}>;

export default function ClubSidebarNavigation({
  clubId,
  activeSection,
}: ClubSidebarNavigationProps): React.JSX.Element {
  const { dictionary } = useI18n();

  function buildSectionHref(section: ClubSection): string {
    const url = new URL(NAVIGATION.CLUB_BY_ID(clubId), GLOBALS.website);
    url.searchParams.set('section', section);
    return `${url.pathname}${url.search}`;
  }

  const sections: ReadonlyArray<Readonly<{ section: ClubSection; label: string }>> = [
    { section: 'profile', label: dictionary.clubs.detail.profile },
    { section: 'media', label: dictionary.clubs.detail.media },
    { section: 'persons', label: dictionary.clubs.detail.persons },
    {
      section: 'championships',
      label: dictionary.clubs.detail.championships,
    },
    { section: 'games', label: dictionary.clubs.detail.games },
    {
      section: 'achievements',
      label: dictionary.clubs.detail.achievements,
    },
  ];

  return (
    <Nav>
      <List ordered gap={2}>
        {sections.map(item => (
          <ListItem
            key={item.section}
            href={buildSectionHref(item.section)}
            active={item.section === activeSection}
            paddingBlock={8}
            paddingInline={10}
          >
            {item.label}
          </ListItem>
        ))}
      </List>
    </Nav>
  );
}
