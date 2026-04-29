/** @format */

import Link from 'next/link';

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
import Text from '@/_components/typography/Text';
import Icon from '@/_components/Icon';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { getCountries } from '@/_actions/country/getCountries';
import type { Country } from '@/_types/country';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
}>;

function parseInt(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function parseString(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

function buildHref(
  page: number,
  pageSize: number,
  sort?: string,
  status?: string,
): string {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('page_size', String(pageSize));
  if (sort) p.set('sort', sort);
  if (status) p.set('status', status);
  return `${NAVIGATION.COUNTRIES}?${p.toString()}`;
}

export default async function CountriesPage({
  searchParams,
}: {
  readonly searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page, DEFAULT_PAGE);
  const pageSize = parseInt(params?.page_size, DEFAULT_PAGE_SIZE);
  const sort = parseString(params?.sort);
  const status = parseString(params?.status) as
    | 'all'
    | 'active'
    | 'inactive'
    | undefined;

  const response = await getCountries({ page, pageSize, sort, status });
  const { metadata } = response;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  const countries = [...response.data].sort(
    (a: Country, b: Country) => Number(b.isActive) - Number(a.isActive),
  );

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.COUNTRIES} icon='countries'>
        <Button icon='countryAdd' href={NAVIGATION.CREATE_A_COUNTRY}>
          {SECTIONS.ADD_COUNTRY}
        </Button>
      </SectionHeader>
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
              <Cell header className='padding-left--16'>
                Slug
              </Cell>
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
              <Cell header align='center'>
                Active
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {countries.length === 0 ? (
              <Row>
                <Cell>No countries available yet.</Cell>
                {Array.from({ length: 8 }).map(() => (
                  <Cell key='#' align='center' className='padding-left--16'>
                    {PLACEHOLDER}
                  </Cell>
                ))}
              </Row>
            ) : (
              countries.map(country => (
                <Row
                  key={country.id}
                  href={NAVIGATION.COUNTRY_BY_ID(country.id)}
                >
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
    </Grid>
  );
}
