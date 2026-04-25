/** @format */

// File: src/app/groups/page.tsx
// Purpose: Render the groups admin listing with pagination and URL-driven filters
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

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
import { getGroups } from '@/_actions/group/getGroups';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { extractGroups } from '@/_helpers/extractGroups';
import {
  isVisibleGroupVisibility,
  normalizeGroupVisibility,
} from '@/_helpers/normalizeGroupVisibility';
import type {
  Group,
  GroupPrivacy,
  GroupStatus,
  GroupVisibility,
} from '@/_types/group';

const PLACEHOLDER_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type GroupsPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
  privacy?: string | string[];
  visibility?: string | string[];
  status?: string | string[];
  search?: string | string[];
  sport?: string | string[];
}>;

type GroupsPageProps = Readonly<{
  searchParams?: Promise<GroupsPageSearchParams>;
}>;

type GroupsPageQuery = Readonly<{
  page: number;
  limit: number;
  privacy?: GroupPrivacy;
  visibility?: GroupVisibility;
  status?: GroupStatus;
  search?: string;
  sport?: string;
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

function parseOptionalString(
  value: string | string[] | undefined,
): string | undefined {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (!normalized) {
    return undefined;
  }

  const trimmed = normalized.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPageHref(query: GroupsPageQuery): string {
  const params = new URLSearchParams();
  params.set('page', query.page.toString());
  params.set('limit', query.limit.toString());

  if (query.privacy) {
    params.set('privacy', query.privacy);
  }

  if (query.visibility) {
    params.set('visibility', query.visibility);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.search) {
    params.set('search', query.search);
  }

  if (query.sport) {
    params.set('sport', query.sport);
  }

  return `${NAVIGATION.GROUPS}?${params.toString()}`;
}

function formatTextValue(value?: string): string {
  if (!value) {
    return PLACEHOLDER_VALUE;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return PLACEHOLDER_VALUE;
  }

  return trimmed;
}

function formatLabel(value?: string): string {
  const normalized = formatTextValue(value);

  if (normalized === PLACEHOLDER_VALUE) {
    return normalized;
  }

  return normalized
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split('_')
    .join(' ')
    .split(' ')
    .filter(Boolean)
    .map(function capitalizeSegment(segment: string): string {
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(' ');
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

function formatSportValue(sport?: Group['sport']): string {
  if (!sport) {
    return PLACEHOLDER_VALUE;
  }

  return formatLabel(sport.localizedName ?? sport.id);
}

function formatLocationValue(location?: Group['location']): string {
  if (!location) {
    return PLACEHOLDER_VALUE;
  }

  const parts = [location.city, location.province, location.country].filter(
    function isLocationPart(part: string | undefined): part is string {
      return Boolean(part && part.trim().length > 0);
    },
  );

  if (parts.length === 0) {
    return PLACEHOLDER_VALUE;
  }

  return parts.join(', ');
}

function isActiveGroup(status?: GroupStatus): boolean {
  return status === 'ACTIVE';
}

export default async function GroupsPage({
  searchParams,
}: GroupsPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );
  const privacy = parseOptionalString(resolvedSearchParams?.privacy) as
    | GroupPrivacy
    | undefined;
  const visibility = normalizeGroupVisibility(
    parseOptionalString(resolvedSearchParams?.visibility),
  );
  const status = parseOptionalString(resolvedSearchParams?.status) as
    | GroupStatus
    | undefined;
  const search = parseOptionalString(resolvedSearchParams?.search);
  const sport = parseOptionalString(resolvedSearchParams?.sport);

  const response = await getGroups({
    page: requestedPage,
    limit: requestedLimit,
    privacy,
    visibility,
    status,
    search,
    sport,
  });
  const pagination = response.pagination;
  const currentPage = Math.max(1, pagination.page ?? requestedPage);
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const currentLimit = Math.max(1, pagination.limit ?? requestedLimit);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const previousHref = hasPreviousPage
    ? buildPageHref({
        page: currentPage - 1,
        limit: currentLimit,
        privacy,
        visibility,
        status,
        search,
        sport,
      })
    : undefined;
  const nextHref = hasNextPage
    ? buildPageHref({
        page: currentPage + 1,
        limit: currentLimit,
        privacy,
        visibility,
        status,
        search,
        sport,
      })
    : undefined;

  const groups = extractGroups(response.data).sort(function sortGroups(
    groupA: Group,
    groupB: Group,
  ): number {
    return groupA.name.localeCompare(groupB.name, 'en', {
      sensitivity: 'base',
    });
  });

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.GROUPS} icon='users'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_GROUP} type='button'>
          {SECTIONS.ADD_GROUP}
        </Button>
      </SectionHeader>
      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header className='padding-left--16'>
                Sport
              </Cell>
              <Cell header className='padding-left--16'>
                Location
              </Cell>
              <Cell header className='padding-left--16'>
                Privacy
              </Cell>
              <Cell header align='center'>
                Visibility
              </Cell>
              <Cell header className='padding-left--16'>
                Join mode
              </Cell>
              <Cell header align='center'>
                Status
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
            {groups.length === 0 ? (
              <Row>
                <Cell>No groups available yet.</Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell align='center'>
                  <Dot inline />
                </Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
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
              groups.map(function renderGroupRow(group) {
                const membershipPrivacy =
                  group.preferences?.membership?.privacy ?? group.privacy;
                const visibilityPreference = normalizeGroupVisibility(
                  group.preferences?.visibility?.visibility ?? group.visibility,
                );
                const membershipJoinMode =
                  group.preferences?.membership?.joinMode ?? group.joinMode;

                return (
                  <Row href={NAVIGATION.GROUP_BY_ID(group.id)} key={group.id}>
                    <Cell icon='users'>{formatTextValue(group.name)}</Cell>
                    <Cell className='padding-left--16'>
                      {formatSportValue(group.sport)}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatLocationValue(group.location)}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatLabel(membershipPrivacy)}
                    </Cell>
                    <Cell align='center'>
                      <Dot
                        active={isVisibleGroupVisibility(visibilityPreference)}
                        inline
                        title={formatLabel(visibilityPreference)}
                      />
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatLabel(membershipJoinMode)}
                    </Cell>
                    <Cell align='center'>
                      <Dot
                        active={isActiveGroup(group.status)}
                        inline
                        title={formatLabel(group.status)}
                      />
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatDate(group.createdAt)}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatDate(group.updatedAt)}
                    </Cell>
                  </Row>
                );
              })
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
