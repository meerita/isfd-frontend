/** @format */

import Link from 'next/link';

import Button from '@/_components/forms/Button';
import Icon from '@/_components/Icon';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import { getEvents } from '@/_actions/event/getEvents';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import type { Event } from '@/_types/event';

const PLACEHOLDER_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type EventsPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
}>;

type EventsPageProps = Readonly<{
  searchParams?: Promise<EventsPageSearchParams>;
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

  return `${NAVIGATION.EVENTS}?${params.toString()}`;
}

function formatTextValue(value?: string): string {
  if (!value) {
    return PLACEHOLDER_VALUE;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_VALUE;
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

function formatDateTime(value?: string): string {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
}

function getSportLabel(event: Event): string {
  if (typeof event.sport === 'string') {
    return formatTextValue(event.sport);
  }

  return formatTextValue(
    event.sport?.localizedName ?? event.sport?.name ?? event.sportId,
  );
}

function getGroupLabel(event: Event): string {
  if (typeof event.group === 'string') {
    return formatTextValue(event.group);
  }

  return formatTextValue(event.group?.name ?? event.groupId);
}

function getPlaceLabel(event: Event): string {
  if (typeof event.place === 'string') {
    return formatTextValue(event.place);
  }

  return formatTextValue(event.place?.name ?? event.placeId);
}

function getCapacityLabel(event: Event): string {
  if (
    typeof event.capacity?.min !== 'number' &&
    typeof event.capacity?.max !== 'number'
  ) {
    return PLACEHOLDER_VALUE;
  }

  return `${event.capacity?.min ?? PLACEHOLDER_VALUE}-${event.capacity?.max ?? PLACEHOLDER_VALUE}`;
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );
  const response = await getEvents({
    page: requestedPage,
    limit: requestedLimit,
  });
  const events = response.data ?? [];
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

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.EVENTS} icon='eventList'>
        <Button icon='plus' href={NAVIGATION.CREATE_AN_EVENT} type='button'>
          {SECTIONS.ADD_EVENT}
        </Button>
      </SectionHeader>

      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Title</Cell>
              <Cell header>Sport</Cell>
              <Cell header>Group</Cell>
              <Cell header>Place</Cell>
              <Cell header>Starts</Cell>
              <Cell header align='center'>
                Capacity
              </Cell>
              <Cell header>Status</Cell>
            </Row>
          </Thead>
          <Tbody>
            {events.length === 0 ? (
              <Row>
                <Cell>No events available yet.</Cell>
                <Cell>{PLACEHOLDER_VALUE}</Cell>
                <Cell>{PLACEHOLDER_VALUE}</Cell>
                <Cell>{PLACEHOLDER_VALUE}</Cell>
                <Cell>{PLACEHOLDER_VALUE}</Cell>
                <Cell align='center'>{PLACEHOLDER_VALUE}</Cell>
                <Cell>{PLACEHOLDER_VALUE}</Cell>
              </Row>
            ) : (
              events.map(function renderEvent(event) {
                return (
                  <Row key={event.id} href={NAVIGATION.EVENT_BY_ID(event.id)}>
                    <Cell>{event.title}</Cell>
                    <Cell>{getSportLabel(event)}</Cell>
                    <Cell>{getGroupLabel(event)}</Cell>
                    <Cell>{getPlaceLabel(event)}</Cell>
                    <Cell>{formatDateTime(event.startTime)}</Cell>
                    <Cell align='center'>{getCapacityLabel(event)}</Cell>
                    <Cell>{formatLabel(event.status)}</Cell>
                  </Row>
                );
              })
            )}
          </Tbody>
        </Table>
      </Main>

      <Grid justifyItems='center' className='margin-block--16'>
        <Grid gap={16} display='flex' alignItems='center'>
          {hasPreviousPage ? (
            <Link href={previousHref!} aria-label='Go to previous page'>
              <Icon name='arrowLeft' size={24} fill='gray' />
            </Link>
          ) : null}
          <Text color='gray' size='small' weight='semibold'>
            Page {currentPage} of {totalPages}
          </Text>
          {hasNextPage ? (
            <Link href={nextHref!} aria-label='Go to next page'>
              <Icon name='arrowRight' size={24} fill='gray' />
            </Link>
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
}
