/** @format */
/**
 * @file src/_components/layout/TopBar.tsx
 * @description Renders the authenticated top navigation bar with locale-aware section labels.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { usePathname } from 'next/navigation';

import { useI18n } from '@/_i18n/I18nProvider';
import NAVIGATION from '@/_constants/navigation';
import GLOBALS from '@/_constants/globals';

import Box from './Box';
import Grid from './Grid';
import Icon from '../Icon';
import List from '../navigation/List';
import ListItem from '../navigation/ListItem';
import Nav from '../navigation/Nav';
import Title from '../typography/Title';

interface TopBarProps {
  username: string;
}

type NavBarItem = Readonly<{
  href: string;
  label: string;
  icon: string;
  hideLabel?: boolean;
}>;

function getCurrentSection(pathname: string): string {
  if (pathname === NAVIGATION.LEGAL_CREATE) {
    return NAVIGATION.LEGAL;
  }

  const segments = pathname.split('/');

  return `/${segments[1] || ''}`;
}

export default function TopBar({
  username,
}: Readonly<TopBarProps>): React.JSX.Element {
  const pathname = usePathname();
  const { dictionary } = useI18n();

  const topBarNavigation: ReadonlyArray<NavBarItem> = [
    {
      href: NAVIGATION.DASHBOARD,
      label: dictionary.navigation.dashboard,
      icon: 'dashboard',
    },
    {
      href: NAVIGATION.COUNTRIES,
      label: dictionary.navigation.countries,
      icon: 'countries',
    },
    {
      href: NAVIGATION.USERS,
      label: dictionary.navigation.users,
      icon: 'users',
    },
    {
      href: NAVIGATION.PERSONS,
      label: dictionary.navigation.persons,
      icon: 'person',
    },
    {
      href: NAVIGATION.CLUBS,
      label: dictionary.navigation.clubs,
      icon: 'club',
    },
    {
      href: NAVIGATION.STADIUMS,
      label: dictionary.navigation.stadiums,
      icon: 'stadiums',
    },
    {
      href: NAVIGATION.FEDERATIONS,
      label: dictionary.navigation.federations,
      icon: 'admin',
    },
    {
      href: NAVIGATION.BRANDS,
      label: dictionary.navigation.brands,
      icon: 'brand',
    },
  ];

  const accountNavigation: ReadonlyArray<NavBarItem> = [
    {
      href: NAVIGATION.ACCOUNT,
      label: dictionary.navigation.account,
      icon: 'account',
    },
    {
      href: NAVIGATION.LOGOUT,
      label: dictionary.navigation.logout,
      icon: 'logout',
      hideLabel: true,
    },
  ];

  const currentSection = getCurrentSection(pathname);

  return (
    <header className='align-items--center display--grid padding-block--8 padding-inline--16 border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'>
      <Grid columns={3} alignItems='center'>
        <Box display='flex' gap={4} alignItems='center'>
          <Icon name='soccer' size={24} />
          <Title size='small' weight='ultraHeavy'>
            {GLOBALS.metadata.short}
          </Title>
        </Box>
        <Nav>
          <List horizontal ordered gap={2}>
            {topBarNavigation.map(function renderTopBarNavigationItem(
              item: Readonly<NavBarItem>,
            ): React.JSX.Element {
              return (
                <ListItem
                  icon={item.icon}
                  key={item.href}
                  href={item.href}
                  active={item.href === currentSection}
                  gap={6}
                >
                  {item.label}
                </ListItem>
              );
            })}
          </List>
        </Nav>
        <Nav className='justify-self--end'>
          <List horizontal ordered gap={4}>
            {accountNavigation.map(function renderAccountNavigationItem(
              item: Readonly<NavBarItem>,
            ): React.JSX.Element {
              if (item.hideLabel) {
                return (
                  <ListItem icon={item.icon} key={item.href} href={item.href}>
                    {''}
                  </ListItem>
                );
              }

              return (
                <ListItem
                  icon={item.icon}
                  key={item.href}
                  href={item.href}
                  active={item.href === currentSection}
                >
                  {username || item.label}
                </ListItem>
              );
            })}
          </List>
        </Nav>
      </Grid>
    </header>
  );
}
