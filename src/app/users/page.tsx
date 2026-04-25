/** @format */

import Link from 'next/link';

import Dot from '@/_components/Dot';
import Icon from '@/_components/Icon';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import { getUsers } from '@/_actions/user/getUsers';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { extractUsers } from '@/_helpers/extractUsers';
import type { Gender } from '@/_types/genders';
import type { User } from '@/_types/user';

const PLACEHOLDER_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

type UsersPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
}>;

type UsersPageProps = Readonly<{
  searchParams?: Promise<UsersPageSearchParams>;
}>;

function parsePositiveInteger(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return fallback;
}

function buildPageHref(page: number, limit: number): string {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  return `${NAVIGATION.USERS}?${params.toString()}`;
}

function formatFullName(profile?: User['profile']): string {
  if (!profile) {
    return PLACEHOLDER_VALUE;
  }

  const parts = [profile.name, profile.middlename, profile.surname]
    .map(part => part?.trim())
    .filter(Boolean) as string[];

  if (parts.length === 0) {
    return PLACEHOLDER_VALUE;
  }

  return parts.join(' ');
}

function formatCountry(country: string | undefined): string {
  if (!country) {
    return PLACEHOLDER_VALUE;
  }

  const normalized = country.trim();

  if (normalized.length === 0) {
    return PLACEHOLDER_VALUE;
  }

  return normalized;
}

function resolveGenderIcon(gender?: Gender): 'male' | 'female' | 'other' {
  switch (gender) {
    case 'MALE':
      return 'male';
    case 'FEMALE':
      return 'female';
    case 'OTHER':
      return 'other';
    default:
      return 'other';
  }
}

function formatDate(value?: string): string {
  if (!value) {
    return PLACEHOLDER_VALUE;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return PLACEHOLDER_VALUE;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
}

export default async function UsersDashboardPage({
  searchParams,
}: UsersPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );

  const response = await getUsers({
    page: requestedPage,
    limit: requestedLimit,
  });
  const pagination = response.pagination;
  const currentPage = Math.max(1, pagination.page ?? requestedPage);
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const currentLimit = Math.max(1, pagination.limit ?? requestedLimit);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const previousHref = hasPreviousPage
    ? buildPageHref(currentPage - 1, currentLimit)
    : undefined;
  const nextHref = hasNextPage
    ? buildPageHref(currentPage + 1, currentLimit)
    : undefined;

  const users = extractUsers(response.data).sort((a: User, b: User) => {
    const activeDelta =
      Number(Boolean(b.access?.isActive)) - Number(Boolean(a.access?.isActive));

    if (activeDelta !== 0) {
      return activeDelta;
    }

    const handleA = a.identity?.username ?? '';
    const handleB = b.identity?.username ?? '';

    return handleA.localeCompare(handleB);
  });

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.USERS} icon='users'>
        <Button icon='userAdd' type='button'>
          {SECTIONS.ADD_USER}
        </Button>
      </SectionHeader>
      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Username</Cell>
              <Cell header className='padding-left--16'>
                Full name
              </Cell>
              <Cell header className='padding-left--16'>
                Country
              </Cell>
              <Cell header align='center'>
                Verified
              </Cell>
              <Cell header align='center'>
                Admin
              </Cell>
              <Cell header align='center'>
                Active
              </Cell>
              <Cell header align='right' className='padding-left--16'>
                Created
              </Cell>
              <Cell header align='right' className='padding-left--16'>
                Updated
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {users.length === 0 ? (
              <Row>
                <Cell>No users available yet.</Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell align='center'>
                  <Dot inline />
                </Cell>
                <Cell align='center'>
                  <Dot inline />
                </Cell>
                <Cell align='center'>
                  <Dot inline />
                </Cell>
                <Cell align='right' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
                <Cell align='right' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
              </Row>
            ) : (
              users
                .filter(
                  (user): user is User & { identity: { username: string } } =>
                    Boolean(user.identity?.username),
                )
                .map(user => (
                  <Row
                    key={user.identity.username}
                    href={NAVIGATION.USER_BY_USERNAME(user.identity.username)}
                  >
                    <Cell
                      icon={resolveGenderIcon(
                        user.profile?.characteristics?.gender,
                      )}
                    >
                      {user.identity?.username}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatFullName(user.profile)}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatCountry(user.profile?.location?.country)}
                    </Cell>
                    <Cell align='center'>
                      {user.verification?.isVerified ? (
                        <Dot active inline />
                      ) : (
                        <Dot inline />
                      )}
                    </Cell>
                    <Cell align='center'>
                      {user.access?.isAdmin ? (
                        <Dot active inline />
                      ) : (
                        <Dot inline />
                      )}
                    </Cell>
                    <Cell align='center'>
                      {user.access?.isActive ? (
                        <Dot active inline />
                      ) : (
                        <Dot inline />
                      )}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatDate(user.metadata?.createdAt)}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatDate(user.metadata?.updatedAt)}
                    </Cell>
                  </Row>
                ))
            )}
          </Tbody>
        </Table>
      </Main>

      <Grid justifyItems='center' className='margin-block--16'>
        <Grid gap={16} display='flex' alignItems='center'>
          {previousHref ? (
            <Link href={previousHref} aria-label='Go to previous page'>
              <Icon name='arrowLeft' size={24} fill='gray' />
            </Link>
          ) : null}
          <Text color='gray' size='small' weight='semibold'>
            Page {currentPage} of {totalPages}
          </Text>
          {nextHref ? (
            <Link href={nextHref} aria-label='Go to next page'>
              <Icon name='arrowRight' size={24} fill='gray' />
            </Link>
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
}
