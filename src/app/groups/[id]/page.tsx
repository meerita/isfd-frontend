/** @format */

// File: src/app/groups/[id]/page.tsx
// Purpose: Render the group detail page and load its current section
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { getGroupById } from '@/_actions/group/getGroupById';
import { getGroupMembers } from '@/_actions/group/getGroupMembers';
import SECTIONS from '@/_constants/sections';
import Members from '../_components/Members';
import Preferences from '../_components/Preferences';
import ProfileDetail from '../_components/ProfileDetail';
import GroupSidebarNavigation from '../_components/GroupSidebarNavigation';

type GroupDetailPageParams = Readonly<{
  id: string;
}>;

type GroupDetailSearchParams = Readonly<{
  section?: string | string[];
}>;

type GroupDetailPageProps = Readonly<{
  params: Promise<GroupDetailPageParams> | GroupDetailPageParams;
  searchParams?: Promise<GroupDetailSearchParams> | GroupDetailSearchParams;
}>;

type ResolvedGroup = NonNullable<Awaited<ReturnType<typeof getGroupById>>>;

function extractSearchValue(value?: string | string[]): string {
  if (!value) {
    return '';
  }

  return (Array.isArray(value) ? value[0] : value).trim();
}

function getSectionContent(sectionKey: string, group: ResolvedGroup) {
  switch (sectionKey) {
    case 'profile':
      return <ProfileDetail group={group} />;
    case 'members':
      return <Members group={group} />;
    case 'preferences':
      return <Preferences group={group} />;
    default:
      return (
        <Text color='gray'>
          The section you are looking for is not available.
        </Text>
      );
  }
}

export default async function GroupPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const groupId = resolvedParams?.id?.trim() ?? '';
  const sectionQuery = extractSearchValue(resolvedSearchParams?.section);
  const activeSection = sectionQuery || 'profile';

  if (!groupId) {
    return (
      <Grid gap={16}>
        <SectionHeader title={SECTIONS.GROUPS} icon='users' />
        <Main>
          <Text color='gray'>Missing group id.</Text>
        </Main>
      </Grid>
    );
  }

  const shouldLoadMembers = activeSection === 'members';
  const [group, members] = await Promise.all([
    getGroupById(groupId),
    shouldLoadMembers ? getGroupMembers(groupId) : Promise.resolve(undefined),
  ]);

  if (!group) {
    return (
      <Grid gap={8}>
        <SectionHeader title={`${SECTIONS.GROUPS} / ${groupId}`} icon='users' />
        <Main>
          <Text color='gray'>Group not found.</Text>
        </Main>
      </Grid>
    );
  }

  const resolvedGroup = members === undefined ? group : { ...group, members };
  const sectionContent = getSectionContent(activeSection, resolvedGroup);

  return (
    <Grid gap={16}>
      <SectionHeader
        title={`${SECTIONS.GROUPS} / ${resolvedGroup.name}`}
        icon='users'
      />
      <Main>
        <Grid className='c-aside-grid' gap={8}>
          <GroupSidebarNavigation group={{ id: resolvedGroup.id }} />
          <Grid gap={32}>{sectionContent}</Grid>
        </Grid>
      </Main>
    </Grid>
  );
}
