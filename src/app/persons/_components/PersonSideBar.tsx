/** @format */

'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';

type PersonSection = 'profile' | 'media' | 'clubs' | 'games' | 'achievements';

type PersonSidebarNavigationProps = Readonly<{
  personId: string;
  activeSection: PersonSection;
}>;

export default function PersonSidebarNavigation({
  personId,
  activeSection,
}: PersonSidebarNavigationProps): React.JSX.Element {
  const { dictionary } = useI18n();

  function buildSectionHref(section: PersonSection): string {
    const url = new URL(NAVIGATION.PERSONS_BY_ID(personId), GLOBALS.website);
    url.searchParams.set('section', section);
    return `${url.pathname}${url.search}`;
  }

  const sections: ReadonlyArray<Readonly<{ section: PersonSection; label: string }>> = [
    { section: 'profile', label: dictionary.persons.detail.profile },
    { section: 'media', label: dictionary.persons.detail.media },
    { section: 'clubs', label: dictionary.persons.detail.clubs },
    { section: 'games', label: dictionary.persons.detail.games },
    {
      section: 'achievements',
      label: dictionary.persons.detail.achievements,
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
