/** @format */

import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import { getUserByUsername } from '@/_actions/user/getUserByUsername';
import SECTIONS from '@/_constants/sections';
import Button from '@/_components/forms/Button';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import ProfileDetail from '../_components/ProfileDetail';
import Privacy from '../_components/Privacy';
import EmailPhone from '../_components/EmailPhone';
import Preferences from '../_components/Preferences';
import Permissions from '../_components/Permissions';
import Notifications from '../_components/Notifications';
import Password from '../_components/Password';
import AccountSidebarNavigation from '../_components/AccountSidebarNavigation';
import Avatar from '../_components/Avatar';
import ChangeUsernameForm from '../_components/forms/Username';
import Skills from '../_components/Skills';
import { extractSports } from '@/_helpers/extractSports';

type UserDetailPageParams = Readonly<{
  username: string;
}>;

type UserDetailSearchParams = Readonly<{
  value?: string | string[];
  username?: string | string[];
  section?: string | string[];
  edit?: string | string[];
}>;

type UserDetailPageProps = Readonly<{
  params: Promise<UserDetailPageParams> | UserDetailPageParams;
  searchParams?: Promise<UserDetailSearchParams> | UserDetailSearchParams;
}>;

type ResolvedUser = NonNullable<Awaited<ReturnType<typeof getUserByUsername>>>;

function extractSearchValue(value?: string | string[]): string {
  if (!value) {
    return '';
  }

  return (Array.isArray(value) ? value[0] : value).trim();
}

function getSectionContent(
  sectionKey: string,
  user: ResolvedUser,
  edit: boolean,
  sports: ReadonlyArray<Awaited<ReturnType<typeof getSports>>['data'][number]>,
) {
  switch (sectionKey) {
    case 'profile':
      return <ProfileDetail user={user} edit={edit} />;
    case 'username':
      return <ChangeUsernameForm user={user} />;
    case 'avatar':
      return <Avatar user={user} />;
    case 'email-phone':
      return <EmailPhone user={user} />;
    case 'preferences':
      return <Preferences user={user} />;
    case 'skills':
      return <Skills user={user} sports={sports} />;
    case 'permissions':
      return <Permissions user={user} />;
    case 'password':
      return <Password user={user} />;
    case 'notifications':
      return <Notifications user={user} />;
    case 'privacy':
      return <Privacy user={user} />;
    default:
      return (
        <Text color='gray'>
          The section you are looking for is not available.
        </Text>
      );
  }
}

export default async function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const slugUsername = resolvedParams?.username?.trim() ?? '';
  const queryUsername = extractSearchValue(
    resolvedSearchParams?.value ?? resolvedSearchParams?.username,
  );
  const username =
    slugUsername && slugUsername !== 'username' ? slugUsername : queryUsername;

  const sectionQuery = extractSearchValue(resolvedSearchParams?.section);
  const activeSection = sectionQuery || 'profile';

  if (!username) {
    return (
      <Grid gap={16}>
        <SectionHeader title={SECTIONS.USERS} icon='users' />
        <Main>
          <Text color='gray'>Missing username.</Text>
        </Main>
      </Grid>
    );
  }

  const [user, sportsResponse] = await Promise.all([
    getUserByUsername(username),
    getSports({ page: 1, limit: 100 }),
  ]);

  if (!user) {
    return (
      <Grid gap={8}>
        <SectionHeader title={`${SECTIONS.USERS} / ${username}`} icon='users' />
        <Main>
          <Text color='gray'>User not found.</Text>
        </Main>
      </Grid>
    );
  }

  const isEdit = extractSearchValue(resolvedSearchParams?.edit) === 'true';
  const normalizedSports = extractSports(sportsResponse.data);
  const sports =
    normalizedSports.length > 0
      ? normalizedSports
      : extractSports(sportsResponse as unknown);
  const sectionContent = getSectionContent(activeSection, user, isEdit, sports);

  return (
    <Grid gap={16}>
      <SectionHeader
        title={`${SECTIONS.USERS} / ${user.identity?.username ?? username}`}
        icon='users'
      >
        <ButtonGroup gap={4}>
          <Button icon='remove' type='button' variant='borderless'>
            Delete User
          </Button>
          <Button
            icon='personEdit'
            type='button'
            href={`?value=${username}&section=profile&edit=true`}
          >
            Edit User
          </Button>
        </ButtonGroup>
      </SectionHeader>
      <Main>
        <Grid className='c-aside-grid' gap={8}>
          <AccountSidebarNavigation
            user={{ username: user.identity?.username ?? username }}
          />
          <Grid gap={32}>{sectionContent}</Grid>
        </Grid>
      </Main>
    </Grid>
  );
}
