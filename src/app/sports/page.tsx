/** @format */

// File: src/app/sports/page.tsx
// Purpose: Render the sports admin listing with pagination
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
import { getSports } from '@/_actions/sport/getSports';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { extractSports } from '@/_helpers/extractSports';
import type { Sport } from '@/_types/sport';
import { ICON_NAME } from '@/_constants/icons';

const PLACEHOLDER_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;
const AVAILABLE_ICON_NAMES = new Set(
  Object.keys(ICON_NAME) as Array<keyof typeof ICON_NAME>,
);

type SportsPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
}>;

type SportsPageProps = Readonly<{
  searchParams?: Promise<SportsPageSearchParams>;
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

  return `${NAVIGATION.SPORTS}?${params.toString()}`;
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

function formatStatus(status: Sport['status']): string {
  const normalized = formatTextValue(status);

  if (normalized === PLACEHOLDER_VALUE) {
    return normalized;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

function isKnownIcon(
  value?: string,
): value is keyof typeof ICON_NAME {
  if (!value) {
    return false;
  }

  return AVAILABLE_ICON_NAMES.has(value as keyof typeof ICON_NAME);
}

function resolveSportIconName(sport: Sport): keyof typeof ICON_NAME {
  if (isKnownIcon(sport.iconKey)) {
    return sport.iconKey;
  }

  if (isKnownIcon(sport.icon)) {
    return sport.icon;
  }

  if (isKnownIcon(sport.localizedName)) {
    return sport.localizedName;
  }

  return ICON_NAME.default;
}

export default async function SportsPage({
  searchParams,
}: SportsPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );

  const response = await getSports({
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

  const sports = extractSports(response.data).sort(function sortSports(
    sportA: Sport,
    sportB: Sport,
  ): number {
    const visibleDelta =
      Number(Boolean(sportB.visible)) - Number(Boolean(sportA.visible));

    if (visibleDelta !== 0) {
      return visibleDelta;
    }

    const popularDelta =
      Number(Boolean(sportB.popular)) - Number(Boolean(sportA.popular));

    if (popularDelta !== 0) {
      return popularDelta;
    }

    return sportA.name.localeCompare(sportB.name, 'en', {
      sensitivity: 'base',
    });
  });

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.SPORTS} icon='sports'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_SPORT} type='button'>
          {SECTIONS.ADD_SPORT}
        </Button>
      </SectionHeader>
      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header className='padding-left--16'>
                Localized name
              </Cell>
              <Cell header className='padding-left--16'>
                Status
              </Cell>
              <Cell header align='center'>
                Visible
              </Cell>
              <Cell header align='center'>
                Popular
              </Cell>
              <Cell header align='center'>
                Icon
              </Cell>
              <Cell header align='center'>
                Image
              </Cell>
              <Cell header align='right' className='padding-left--16'>
                Updated
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {sports.length === 0 ? (
              <Row>
                <Cell>No sports available yet.</Cell>
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
                <Cell align='center'>
                  <Dot inline />
                </Cell>
                <Cell align='right' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
              </Row>
            ) : (
              sports.map(function renderSportRow(sport) {
                return (
                  <Row key={sport.id} href={NAVIGATION.SPORT_BY_ID(sport.id)}>
                    <Cell icon={resolveSportIconName(sport)}>
                      {sport.name}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatTextValue(sport.localizedName)}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatStatus(sport.status)}
                    </Cell>
                    <Cell align='center'>
                      {sport.visible ? <Dot active inline /> : <Dot inline />}
                    </Cell>
                    <Cell align='center'>
                      {sport.popular ? <Dot active inline /> : <Dot inline />}
                    </Cell>
                    <Cell align='center'>
                      {sport.iconKey || sport.icon ? (
                        <Dot active inline />
                      ) : (
                        <Dot inline />
                      )}
                    </Cell>
                    <Cell align='center'>
                      {sport.image ? <Dot active inline /> : <Dot inline />}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatDate(sport.updatedAt)}
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
