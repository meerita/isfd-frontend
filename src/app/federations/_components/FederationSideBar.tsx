/** @format */

'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { FederationSection } from './FederationInformationTab';

type FederationSidebarNavigationProps = Readonly<{
  federationId: string;
  activeSection: FederationSection;
}>;

export default function FederationSidebarNavigation({
  federationId,
  activeSection,
}: FederationSidebarNavigationProps): React.JSX.Element {
  const { dictionary } = useI18n();

  function buildSectionHref(section: FederationSection): string {
    const url = new URL(NAVIGATION.FEDERATION_BY_ID(federationId), GLOBALS.website);
    url.searchParams.set('section', section);
    return `${url.pathname}${url.search}`;
  }

  const sections: ReadonlyArray<
    Readonly<{ section: FederationSection; label: string }>
  > = [
    { section: 'profile', label: dictionary.federations.detail.profile },
    { section: 'media', label: dictionary.federations.detail.media },
    { section: 'teams', label: dictionary.federations.detail.teams },
    {
      section: 'championships',
      label: dictionary.federations.detail.championships,
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
