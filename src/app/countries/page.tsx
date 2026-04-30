/** @format */

import Link from 'next/link';

import { getAdminCountries } from '@/_actions/country/getCountries';
import Dot from '@/_components/Dot';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Icon from '@/_components/Icon';
import Text from '@/_components/typography/Text';
import { resolveCountryErrorMessage } from '@/_constants/countryErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { CountrySort, CountryStatusFilter } from '@/_types/country';
import CountryFilters from './_components/CountryFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CountrySort = 'name_asc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
}>;

type QueryParam = string | string[] | undefined;

function parsePositiveInt(
  value: QueryParam,
  fallback: number,
  max?: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  const integer = Math.floor(parsed);
  return max ? Math.min(integer, max) : integer;
}

function parseString(value: QueryParam): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

function buildHref(
  page: number,
  pageSize: number,
  sort: CountrySort,
  status?: CountryStatusFilter,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);

  return `${NAVIGATION.COUNTRIES}?${params.toString()}`;
}

export default async function CountriesPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as CountrySort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as CountryStatusFilter | undefined;

  const countriesResponse = await getAdminCountries({
    page,
    pageSize,
    sort,
    status,
  });
  const { metadata } = countriesResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.COUNTRIES} icon='countries'>
        <Button icon='countryAdd' href={NAVIGATION.CREATE_A_COUNTRY}>
          {SECTIONS.ADD_COUNTRY}
        </Button>
      </SectionHeader>

      <CountryFilters pageSize={pageSize} sort={sort} status={status} />

      {countriesResponse.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load countries.</Text>
            <Text size='small' color='gray'>
              {resolveCountryErrorMessage(countriesResponse.error)}
            </Text>
          </Grid>
        </Main>
      ) : (
        <>
          <Main>
            <Table>
              <Thead>
                <Row>
                  <Cell header>Name</Cell>
                  <Cell header align='center' className='padding-left--16'>
                    ISO 2
                  </Cell>
                  <Cell header align='center' className='padding-left--16'>
                    ISO 3
                  </Cell>
                  <Cell header className='padding-left--16'>Slug</Cell>
                  <Cell header className='padding-left--16'>
                    Translation key
                  </Cell>
                  <Cell header align='center' className='padding-left--16'>
                    Continent
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Provinces
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Cities
                  </Cell>
                  <Cell header align='center'>Active</Cell>
                </Row>
              </Thead>
              <Tbody>
                {countriesResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No countries found for the current filters.</Cell>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Cell key={`none-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  countriesResponse.data.map(country => (
                    <Row key={country.id} href={NAVIGATION.COUNTRY_BY_ID(country.id)}>
                      <Cell>{country.name}</Cell>
                      <Cell align='center' className='padding-left--16'>
                        {country.iso2Code ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='center' className='padding-left--16'>
                        {country.iso3Code ?? PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>{country.slug}</Cell>
                      <Cell className='padding-left--16'>
                        {country.translationKey}
                      </Cell>
                      <Cell align='center' className='padding-left--16'>
                        {country.continentCode ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {country.provinceCount ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {country.cityCount ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {country.isActive ? <Dot active inline /> : <Dot inline />}
                      </Cell>
                    </Row>
                  ))
                )}
              </Tbody>
            </Table>
          </Main>

          <Grid justifyItems='center' className='margin-block--16'>
            <Grid gap={16} display='flex' alignItems='center'>
              {hasPrev ? (
                <Link
                  href={buildHref(currentPage - 1, pageSize, sort, status)}
                  aria-label='Previous'
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                Page {currentPage} of {totalPages}
              </Text>
              {hasNext ? (
                <Link
                  href={buildHref(currentPage + 1, pageSize, sort, status)}
                  aria-label='Next'
                >
                  <Icon name='arrowRight' size={24} fill='gray' />
                </Link>
              ) : null}
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
}
