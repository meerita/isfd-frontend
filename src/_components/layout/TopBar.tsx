/** @format */

'use client';
import { usePathname } from 'next/navigation';

import List from '../navigation/List';
import ListItem from '../navigation/ListItem';
import Nav from '../navigation/Nav';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import Grid from './Grid';
import Icon from '../Icon';
import Title from '../typography/Title';
import Box from './Box';
import GLOBALS from '@/_constants/globals';

interface TopBarProps {
  username: string;
}

type NavBarItem = Readonly<{
  href: string;
  label: string;
  icon: string;
}>;

function getCurrentSection(pathname: string): string {
  if (pathname === NAVIGATION.LEGAL_CREATE) {
    return NAVIGATION.LEGAL;
  }

  const segments = pathname.split('/');
  return `/${segments[1] || ''}`;
}

export default function TopBar({ username }: Readonly<TopBarProps>) {
  const pathname = usePathname();

  const topBarNavigation: ReadonlyArray<NavBarItem> = [
    {
      href: NAVIGATION.DASHBOARD,
      label: SECTIONS.DASHBOARD,
      icon: 'dashboard',
    },
    {
      href: NAVIGATION.COUNTRIES,
      label: SECTIONS.COUNTRIES,
      icon: 'countries',
    },
    { href: NAVIGATION.USERS, label: SECTIONS.USERS, icon: 'users' },
    { href: NAVIGATION.PERSONS, label: SECTIONS.PERSONS, icon: 'person' },
    { href: NAVIGATION.CLUBS, label: SECTIONS.CLUBS, icon: 'club' },
    { href: NAVIGATION.STADIUMS, label: SECTIONS.STADIUMS, icon: 'stadiums' },
    { href: NAVIGATION.BRANDS, label: SECTIONS.BRANDS, icon: 'brand' },
  ];

  const accountNavigation: ReadonlyArray<NavBarItem> = [
    { href: NAVIGATION.ACCOUNT, label: SECTIONS.ACCOUNT, icon: 'account' },
    { href: NAVIGATION.LOGOUT, label: SECTIONS.LOGOUT, icon: 'logout' },
  ];

  const currentSection = getCurrentSection(pathname);

  return (
    <header className='align-items--center display--grid padding-block--8 padding-inline--16 border-bottom-width--1 border-bottom-style--solid border-bottom-color--lightest-gray'>
      <Grid columns={3} alignItems='center'>
        <Box display='flex' gap={4} alignItems='center'>
          <Icon name='soccer' size={24} />
          <Title size={'small'} weight='ultraHeavy'>
            {GLOBALS.metadata.short}
          </Title>
        </Box>
        <Nav>
          <List horizontal ordered gap={2}>
            {topBarNavigation.map((item: Readonly<NavBarItem>) => (
              <ListItem
                icon={item.icon}
                key={item.href}
                href={item.href}
                active={item.href === currentSection}
                gap={6}
              >
                {item.label}
              </ListItem>
            ))}
          </List>
        </Nav>
        <Nav className='justify-self--end'>
          <List horizontal ordered gap={4}>
            {accountNavigation.map((item: Readonly<NavBarItem>) =>
              item.label === 'Logout' ? (
                <ListItem icon={item.icon} key={item.href} href={item.href}>
                  {''}
                </ListItem>
              ) : (
                <ListItem
                  icon={item.icon}
                  key={item.href}
                  href={item.href}
                  active={item.href === currentSection}
                >
                  {username || item.label}
                </ListItem>
              ),
            )}
          </List>
        </Nav>
      </Grid>
    </header>
  );
}
