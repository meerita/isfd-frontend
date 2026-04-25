/** @format */
'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import GLOBALS from '@/_constants/globals';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { useSearchParams } from 'next/navigation';

interface AccountSidebarNavigationProps {
  user: Readonly<{ username: string }>;
}

export default function AccountSidebarNavigation({
  user,
}: Readonly<AccountSidebarNavigationProps>) {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'profile';

  function buildSectionHref(sectionKey: string) {
    const url = new URL(
      NAVIGATION.USER_BY_USERNAME(user.username),
      GLOBALS.website,
    );
    url.searchParams.set('section', sectionKey);
    return `${url.pathname}${url.search}`;
  }

  const accountNavigation = [
    {
      href: buildSectionHref('profile'),
      label: SECTIONS.PROFILE,
    },
    {
      href: buildSectionHref('avatar'),
      label: SECTIONS.AVATAR,
    },
    {
      href: buildSectionHref('username'),
      label: SECTIONS.USERNAME,
    },
    {
      href: buildSectionHref('permissions'),
      label: SECTIONS.PERMISSIONS,
    },
    {
      href: buildSectionHref('email-phone'),
      label: SECTIONS.EMAIL_PHONE,
    },
    {
      href: buildSectionHref('password'),
      label: SECTIONS.PASSWORD,
    },
    {
      href: buildSectionHref('preferences'),
      label: SECTIONS.PREFERENCES,
    },
    {
      href: buildSectionHref('skills'),
      label: SECTIONS.SKILLS,
    },
    {
      href: buildSectionHref('notifications'),
      label: SECTIONS.NOTIFICATIONS,
    },
    {
      href: buildSectionHref('privacy'),
      label: SECTIONS.PRIVACY,
    },
    {
      href: buildSectionHref('sessions'),
      label: SECTIONS.SESSIONS,
    },
    {
      href: buildSectionHref('activities'),
      label: SECTIONS.ACTIVITIES,
    },
    { href: NAVIGATION.LOGOUT, label: SECTIONS.LOGOUT },
  ];

  return (
    <Nav>
      <List ordered gap={2}>
        {accountNavigation.map(function mapSections(item) {
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
