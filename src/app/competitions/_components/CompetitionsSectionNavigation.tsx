/** @format */

'use client';

import { usePathname } from 'next/navigation';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import NAVIGATION from '@/_constants/navigation';

const ITEMS = [
  { href: NAVIGATION.COMPETITIONS, label: 'Overview' },
  { href: NAVIGATION.COMPETITION_TYPES, label: 'Competition Types' },
  { href: NAVIGATION.COMPETITIONS_LIST, label: 'Competitions' },
  { href: NAVIGATION.COMPETITION_EDITIONS, label: 'Competition Editions' },
] as const;

export default function CompetitionsSectionNavigation(): React.JSX.Element {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === NAVIGATION.COMPETITIONS) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Nav>
      <List horizontal ordered gap={4}>
        {ITEMS.map(item => (
          <ListItem key={item.href} href={item.href} active={isActive(item.href)}>
            {item.label}
          </ListItem>
        ))}
      </List>
    </Nav>
  );
}
