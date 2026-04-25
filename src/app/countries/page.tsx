/** @format */

import Dot from '@/_components/Dot';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import NAVIGATION from '@/_constants/navigation';
import { extractCountries } from '@/_helpers/extractCountries';
import { getCountries } from '@/_actions/country/getCountries';
import type { Country } from '@/_types/country';
import SECTIONS from '@/_constants/sections';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Link from 'next/link';
import Icon from '@/_components/Icon';

const PLACEHOLDER_VALUE = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

type CountriesPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
}>;

type CountriesPageProps = Readonly<{
  searchParams?: Promise<CountriesPageSearchParams>;
}>;

function formatCount(value?: number): string {
  if (typeof value === 'number') {
    return value.toString();
  }

  return PLACEHOLDER_VALUE;
}

function formatContinentLabel(continent: Country['continent']): string {
  if (!continent) {
    return PLACEHOLDER_VALUE;
  }

  return continent
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCoordinate(value?: number): string {
  if (typeof value === 'number') {
    return value.toFixed(4);
  }

  return PLACEHOLDER_VALUE;
}

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

  return `${NAVIGATION.COUNTRIES}?${params.toString()}`;
}

export default async function CountriesDashboardPage({
  searchParams,
}: CountriesPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    DEFAULT_PAGE,
  );
  const requestedLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    DEFAULT_LIMIT,
  );

  const response = await getCountries({
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
    : null;
  const nextHref = hasNextPage
    ? buildPageHref(currentPage + 1, currentLimit)
    : null;

  const countries = extractCountries(response.data).sort(
    (a: Country, b: Country) => Number(b.active) - Number(a.active),
  );

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.COUNTRIES} icon='countries'>
        <Button icon='countryAdd' type='button'>
          {SECTIONS.ADD_COUNTRY}
        </Button>
      </SectionHeader>
      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header className='padding-left--16' align='center'>
                Code
              </Cell>
              <Cell header className='padding-left--16' align='center'>
                Provinces
              </Cell>
              <Cell header className='padding-left--16'>
                Continent
              </Cell>
              <Cell header align='center'>
                Active
              </Cell>
              <Cell header align='right' className='padding-left--16'>
                Latitude
              </Cell>
              <Cell header align='right' className='padding-left--16'>
                Longitude
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {countries.length === 0 ? (
              <Row>
                <Cell>No countries available yet.</Cell>
                <Cell align='center' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
                <Cell align='center' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
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
              countries.map(country => (
                <Row
                  key={country.id}
                  href={NAVIGATION.COUNTRY_BY_ID(country.id)}
                >
                  <Cell>{country.name}</Cell>
                  <Cell align='center' className='padding-left--16'>
                    {country.countryCode}
                  </Cell>
                  <Cell align='center' className='padding-left--16'>
                    {formatCount(country.provinces?.length)}
                  </Cell>
                  <Cell className='padding-left--16'>
                    {formatContinentLabel(country.continent)}
                  </Cell>
                  <Cell align='center'>
                    {country.active ? <Dot active inline /> : <Dot inline />}
                  </Cell>
                  <Cell align='right' className='padding-left--16'>
                    {formatCoordinate(country.coordinates?.lat)}
                  </Cell>
                  <Cell align='right' className='padding-left--16'>
                    {formatCoordinate(country.coordinates?.lng)}
                  </Cell>
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
