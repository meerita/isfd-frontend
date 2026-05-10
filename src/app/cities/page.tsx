/** @format */

import Link from 'next/link';

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminCities } from '@/_actions/city/getCities';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
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
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { parseUuid } from '@/_helpers/uuid';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { AdminCitySort, CityStatusFilter } from '@/_types/city';
import CityFilters from './_components/CityFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: AdminCitySort = 'updated_at_desc';

type SearchParams = Readonly<{
  country_id?: string | string[];
  page?: string | string[];
  page_size?: string | string[];
  province?: string | string[];
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
  sort: AdminCitySort,
  status?: CityStatusFilter,
  countryId?: string,
  province?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (countryId) params.set('country_id', countryId);
  if (province) params.set('province', province);

  return `${NAVIGATION.CITIES}?${params.toString()}`;
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
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const countryId = parseUuid(params?.country_id);
  const province = parseString(params?.province);
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as AdminCitySort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as CityStatusFilter | undefined;

  const [citiesResponse, countries, provinces] = await Promise.all([
    getAdminCities({
      countryId,
      province,
      page,
      pageSize,
      sort,
      status,
    }),
    getAllCountries(),
    countryId
      ? getAdminProvincesByCountryId(countryId)
      : Promise.resolve([]),
  ]);

  const countryLabels = new Map(countries.map(country => [country.id, country.name]));
  const { metadata } = citiesResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities'>
        <Button icon='locationAdd' href={NAVIGATION.CREATE_A_CITY(countryId)}>
          {SECTIONS.ADD_CITY}
        </Button>
      </SectionHeader>

      <CityFilters
        pageSize={pageSize}
        sort={sort}
        status={status}
        countryId={countryId}
        province={province}
        countries={countries}
        provinces={provinces}
      />

      {citiesResponse.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load cities.</Text>
            <Text size='small' color='gray'>
              {resolveCityErrorMessage(citiesResponse.error)}
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
                  <Cell header className='padding-left--16'>Slug</Cell>
                  <Cell header className='padding-left--16'>
                    Translation key
                  </Cell>
                  <Cell header className='padding-left--16'>Country</Cell>
                  <Cell header className='padding-left--16'>Region</Cell>
                  <Cell header className='padding-left--16'>Province</Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Lat
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Lng
                  </Cell>
                  <Cell header align='center'>Active</Cell>
                </Row>
              </Thead>
              <Tbody>
                {citiesResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No cities found for the current filters.</Cell>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Cell key={`none-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  citiesResponse.data.map(city => (
                    <Row key={city.id} href={NAVIGATION.CITY_BY_ID(city.id)}>
                      <Cell>{city.name}</Cell>
                      <Cell className='padding-left--16'>{city.slug}</Cell>
                      <Cell className='padding-left--16'>
                        {city.translationKey}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {city.countryName ??
                          countryLabels.get(city.countryId) ??
                          city.countryId}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {formatText(city.regionName)}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {formatText(city.provinceName)}
                      </Cell>
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
                  href={buildHref(
                    currentPage - 1,
                    pageSize,
                    sort,
                    status,
                    countryId,
                    province,
                  )}
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
                  href={buildHref(
                    currentPage + 1,
                    pageSize,
                    sort,
                    status,
                    countryId,
                    province,
                  )}
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
