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
import { getCities } from '@/_actions/city/getCities';
import { getAllCountries } from '@/_actions/country/getAllCountries';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

type SearchParams = Readonly<{
  countryId?: string | string[];
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
}>;

function parseIntParam(value: string | string[] | undefined, fallback: number): number {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function parseStringParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

function buildHref(
  countryId: string,
  page: number,
  pageSize: number,
  sort?: string,
  status?: string,
): string {
  const p = new URLSearchParams();
  p.set('countryId', countryId);
  p.set('page', String(page));
  p.set('page_size', String(pageSize));
  if (sort) p.set('sort', sort);
  if (status) p.set('status', status);
  return `${NAVIGATION.CITIES}?${p.toString()}`;
}

function formatCoordinate(value: number | null): string {
  return value !== null ? value.toFixed(4) : PLACEHOLDER;
}

function formatText(value: string | null): string {
  if (!value) return PLACEHOLDER;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER;
}

export default async function CitiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const countryId = parseStringParam(params?.countryId);
  const page = parseIntParam(params?.page, DEFAULT_PAGE);
  const pageSize = parseIntParam(params?.page_size, DEFAULT_PAGE_SIZE);
  const sort = parseStringParam(params?.sort);
  const status = parseStringParam(params?.status) as 'all' | 'active' | 'inactive' | undefined;

  const [countries, citiesResponse] = await Promise.all([
    getAllCountries(),
    countryId
      ? getCities({ countryId, page, pageSize, sort, status })
      : Promise.resolve(null),
  ]);

  const cities = citiesResponse?.data ?? [];
  const metadata = citiesResponse?.metadata;
  const currentPage = metadata?.page ?? DEFAULT_PAGE;
  const totalPages = Math.max(1, metadata?.totalPages ?? 1);
  const hasPrev = metadata?.hasPreviousPage ?? false;
  const hasNext = metadata?.hasNextPage ?? false;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities'>
        {countryId ? (
          <Button icon='locationAdd' href={NAVIGATION.CREATE_A_CITY(countryId)}>
            {SECTIONS.ADD_CITY}
          </Button>
        ) : null}
      </SectionHeader>

      <form method='GET' action={NAVIGATION.CITIES}>
        <Grid display='flex' gap={8} alignItems='center'>
          <select name='countryId' defaultValue={countryId ?? ''} className='c-smallbutton c-input'>
            <option value=''>Select a country…</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type='submit' className='c-smallbutton'>
            Show cities
          </button>
        </Grid>
      </form>

      {countryId ? (
        <>
          <Main>
            <Table>
              <Thead>
                <Row>
                  <Cell header>Name</Cell>
                  <Cell header className='padding-left--16'>Slug</Cell>
                  <Cell header className='padding-left--16'>Translation key</Cell>
                  <Cell header className='padding-left--16'>Region</Cell>
                  <Cell header className='padding-left--16'>Province</Cell>
                  <Cell header align='right' className='padding-left--16'>Lat</Cell>
                  <Cell header align='right' className='padding-left--16'>Lng</Cell>
                  <Cell header align='center'>Active</Cell>
                </Row>
              </Thead>
              <Tbody>
                {cities.length === 0 ? (
                  <Row>
                    <Cell>No cities found for this country.</Cell>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Cell key={i} className='padding-left--16' />
                    ))}
                  </Row>
                ) : (
                  cities.map(city => (
                    <Row key={city.id} href={NAVIGATION.CITY_BY_ID(city.id)}>
                      <Cell>{city.name}</Cell>
                      <Cell className='padding-left--16'>{city.slug}</Cell>
                      <Cell className='padding-left--16'>{city.translationKey}</Cell>
                      <Cell className='padding-left--16'>{formatText(city.regionName)}</Cell>
                      <Cell className='padding-left--16'>{formatText(city.provinceName)}</Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatCoordinate(city.latitude)}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatCoordinate(city.longitude)}
                      </Cell>
                      <Cell align='center'>
                        {city.isActive ? <Dot active inline /> : <Dot inline />}
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
                  href={buildHref(countryId, currentPage - 1, pageSize, sort, status)}
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
                  href={buildHref(countryId, currentPage + 1, pageSize, sort, status)}
                  aria-label='Next'
                >
                  <Icon name='arrowRight' size={24} fill='gray' />
                </Link>
              ) : null}
            </Grid>
          </Grid>
        </>
      ) : (
        <Text size='small' color='gray'>
          Select a country to browse its cities.
        </Text>
      )}
    </Grid>
  );
}
