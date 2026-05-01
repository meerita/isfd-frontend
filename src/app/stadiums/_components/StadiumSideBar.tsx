/** @format */

'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { StadiumSection } from './StadiumInformationTab';

type StadiumSidebarNavigationProps = Readonly<{
  stadiumId: string;
  activeSection: StadiumSection;
}>;

export default function StadiumSidebarNavigation({
  stadiumId,
  activeSection,
}: StadiumSidebarNavigationProps): React.JSX.Element {
  const { dictionary } = useI18n();

  function buildSectionHref(section: StadiumSection): string {
    const url = new URL(NAVIGATION.STADIUM_BY_ID(stadiumId), GLOBALS.website);
    url.searchParams.set('section', section);
    return `${url.pathname}${url.search}`;
  }

  const sections: ReadonlyArray<Readonly<{ section: StadiumSection; label: string }>> = [
    { section: 'profile', label: dictionary.stadiums.detail.profile },
    { section: 'media', label: dictionary.stadiums.detail.media },
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
