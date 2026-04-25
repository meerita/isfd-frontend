/** @format */
'use client';

// File: src/app/groups/_components/GroupSidebarNavigation.tsx
// Purpose: Render the sidebar navigation for group detail sections
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useSearchParams } from 'next/navigation';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';

type GroupSidebarNavigationProps = Readonly<{
  group: Readonly<{ id: string }>;
}>;

function buildSectionHref(groupId: string, sectionKey: string): string {
  const url = new URL(NAVIGATION.GROUP_BY_ID(groupId), GLOBALS.website);
  url.searchParams.set('section', sectionKey);

  return `${url.pathname}${url.search}`;
}

export default function GroupSidebarNavigation({
  group,
}: GroupSidebarNavigationProps) {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'profile';
  const groupNavigation = [
    {
      href: buildSectionHref(group.id, 'profile'),
      label: SECTIONS.PROFILE,
    },
    {
      href: buildSectionHref(group.id, 'members'),
      label: SECTIONS.MEMBERS,
    },
    {
      href: buildSectionHref(group.id, 'preferences'),
      label: SECTIONS.PREFERENCES,
    },
  ];

  return (
    <Nav>
      <List ordered gap={2}>
        {groupNavigation.map(function mapSections(item) {
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
