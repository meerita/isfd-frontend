/** @format */

import { getPlacesList } from '@/_actions/place/getPlacesList';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Icon from '@/_components/Icon';
import Link from 'next/link';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import type { Place } from '@/_types/place';

const EMPTY_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type PlacesPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
}>;

type PlacesPageProps = Readonly<{
  searchParams?: Promise<PlacesPageSearchParams>;
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

  return `${NAVIGATION.PLACES}?${params.toString()}`;
}

function formatTextValue(value?: string): string {
  if (!value) {
    return EMPTY_VALUE;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : EMPTY_VALUE;
}

function formatStatus(value?: string): string {
  const normalized = formatTextValue(value);

  if (normalized === EMPTY_VALUE) {
    return normalized;
  }

  return normalized
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCityLabel(place: Place): string {
  if (typeof place.city === 'string') {
    return formatTextValue(place.city);
  }

  if (place.city?.name) {
    return formatTextValue(place.city.name);
  }

  return formatTextValue(place.cityId ?? place.cityID ?? place.city?.id);
}

function getSportsCount(place: Place): string {
  return (
    place.sportIDs?.length?.toString() ??
    place.sportIds?.length?.toString() ??
    EMPTY_VALUE
  );
}

export default async function PlacesPage({
  searchParams,
}: PlacesPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );
  const response = await getPlacesList({
    page: requestedPage,
    limit: requestedLimit,
  });
  const places = response.data ?? [];
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
      <SectionHeader title={SECTIONS.PLACES} icon='business'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_PLACE} type='button'>
          {SECTIONS.ADD_PLACE}
        </Button>
      </SectionHeader>

      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header>City</Cell>
              <Cell header align='center'>
                Sports
              </Cell>
              <Cell header>Status</Cell>
              <Cell header>Description</Cell>
            </Row>
          </Thead>
          <Tbody>
            {places.length === 0 ? (
              <Row>
                <Cell>No places available yet.</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell align='center'>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
              </Row>
            ) : (
              places.map(place => (
                <Row key={place.id} href={NAVIGATION.PLACE_BY_ID(place.id)}>
                  <Cell>{place.name}</Cell>
                  <Cell>{getCityLabel(place)}</Cell>
                  <Cell align='center'>{getSportsCount(place)}</Cell>
                  <Cell>{formatStatus(place.status)}</Cell>
                  <Cell>{formatTextValue(place.description)}</Cell>
                </Row>
              ))
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
