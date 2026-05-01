/** @format */
/**
 * @file src/app/persons/_components/PersonSideBar.tsx
 * @description Renders localized person sidebar navigation.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { useSearchParams } from 'next/navigation';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { Person } from '@/_types/person';

export default function PersonSidebarNavigation({
  person,
}: Readonly<{
  person: Readonly<Person>;
}>): React.JSX.Element {
  const { dictionary } = useI18n();
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'profile';

  function buildSectionHref(sectionKey: string): string {
    const url = new URL(NAVIGATION.PERSONS_BY_ID(person.id), GLOBALS.website);
    url.searchParams.set('section', sectionKey);
    return `${url.pathname}${url.search}`;
  }

  const accountNavigation = [
    {
      href: buildSectionHref('profile'),
      label: dictionary.persons.detail.profile,
    },
    {
      href: buildSectionHref('media'),
      label: dictionary.persons.detail.media,
    },
    {
      href: buildSectionHref('goals'),
      label: 'Goles',
    },
    {
      href: buildSectionHref('games'),
      label: 'Partidos',
    },
    {
      href: buildSectionHref('achievements'),
      label: 'Logros y Premios',
    },
  ];

  return (
    <Nav>
      <List ordered gap={2}>
        {accountNavigation.map(function mapSections(item): React.JSX.Element {
          const itemSection = new URL(
            item.href,
            GLOBALS.website,
          ).searchParams.get('section');
          const active = itemSection === section;

          return (
            <ListItem
              key={item.href}
              href={item.href}
              active={active}
              paddingBlock={8}
              paddingInline={10}
            >
              {item.label}
            </ListItem>
          );
        })}
      </List>
    </Nav>
  );
}
