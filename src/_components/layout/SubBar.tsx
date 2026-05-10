/** @format */
/**
 * @file src/_components/layout/subBar.tsx
 * @description Renders the authenticated top navigation bar with locale-aware section labels.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';
import { usePathname, useSearchParams } from 'next/navigation';

import NAVIGATION from '@/_constants/navigation';
import List from '../navigation/List';
import ListItem from '../navigation/ListItem';
import Nav from '../navigation/Nav';

export type SubBarItem = Readonly<{
  href: string;
  label: string;
  hideLabel?: boolean;
}>;

type SubBarProps = Readonly<{
  items: ReadonlyArray<SubBarItem>;
}>;

function getSectionFromHref(href: string): string {
  if (href.startsWith(NAVIGATION.COMPETITIONS_LIST)) {
    return 'competitions';
  }

  if (href.startsWith(NAVIGATION.COMPETITION_PYRAMIDS)) {
    return 'pyramids';
  }

  if (href.startsWith(NAVIGATION.COMPETITION_TIERS)) {
    return 'tiers';
  }

  if (href.startsWith(NAVIGATION.COMPETITION_EDITIONS)) {
    return 'editions';
  }

  if (href.startsWith(NAVIGATION.COMPETITIONS)) {
    const url = new URL(href, 'https://isfd.local');
    return url.searchParams.get('section') ?? 'overview';
  }

  return href;
}

function getCurrentSection(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  if (pathname === NAVIGATION.COMPETITIONS) {
    return searchParams.get('section') ?? 'overview';
  }

  if (pathname.startsWith(NAVIGATION.COMPETITIONS_LIST)) {
    return 'competitions';
  }

  if (pathname.startsWith(NAVIGATION.COMPETITION_PYRAMIDS)) {
    return 'pyramids';
  }

  if (pathname.startsWith(NAVIGATION.COMPETITION_TIERS)) {
    return 'tiers';
  }

  if (pathname.startsWith(NAVIGATION.COMPETITION_EDITIONS)) {
    return 'editions';
  }

  return pathname;
}

export default function SubBar({ items }: SubBarProps): React.JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = getCurrentSection(pathname, searchParams);

  return (
    <Nav className='justify-items--center' padding={8}>
      <List horizontal ordered gap={2}>
        {items.map(function renderSubBarNavigationItem(
          item: SubBarItem,
        ): React.JSX.Element {
          return (
            <ListItem
              key={`${item.href}-${item.label}`}
              href={item.href}
              active={getSectionFromHref(item.href) === currentSection}
              gap={6}
              paddingBlock={6}
            >
              {item.label}
            </ListItem>
          );
        })}
      </List>
    </Nav>
  );
}
