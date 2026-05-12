/** @format */

import List from '@/_components/navigation/List';
import ListItem from '@/_components/navigation/ListItem';
import Nav from '@/_components/navigation/Nav';
import type { AccountSection } from '@/_constants/account';
import { buildAccountHref } from '@/_helpers/account';
import { ACCOUNT_COPY } from '../_constants/copy';

export default function AccountSidebarNavigation({
  activeSection,
}: Readonly<{
  activeSection: AccountSection;
}>): React.JSX.Element {
  const navigation = [
    {
      key: 'overview',
      label: ACCOUNT_COPY.sections.overview,
      href: buildAccountHref({ section: 'overview' }),
    },
    {
      key: 'profile',
      label: ACCOUNT_COPY.sections.profile,
      href: buildAccountHref({ section: 'profile' }),
    },
    {
      key: 'contributions',
      label: ACCOUNT_COPY.sections.contributions,
      href: buildAccountHref({ section: 'contributions' }),
    },
    {
      key: 'session',
      label: ACCOUNT_COPY.sections.session,
      href: buildAccountHref({ section: 'session' }),
    },
  ] as const;

  return (
    <Nav>
      <List ordered gap={2}>
        {navigation.map(item => (
          <ListItem
            key={item.key}
            href={item.href}
            active={item.key === activeSection}
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
