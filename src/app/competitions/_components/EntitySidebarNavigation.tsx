/** @format */

'use client';

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';

type SidebarItem = Readonly<{
  id: string;
  label: string;
  href: string;
}>;

type EntitySidebarNavigationProps = Readonly<{
  items: ReadonlyArray<SidebarItem>;
  activeItem: string;
}>;

export default function EntitySidebarNavigation({
  items,
  activeItem,
}: EntitySidebarNavigationProps): React.JSX.Element {
  return (
    <Nav>
      <List ordered gap={2}>
        {items.map(item => (
          <ListItem
            key={item.id}
            href={item.href}
            active={item.id === activeItem}
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
