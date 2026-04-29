/** @format */

import Link from 'next/link';

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getCityById } from '@/_actions/city/getCityById';
import { getAdminStadiums } from '@/_actions/stadium/getAdminStadiums';
import Button from '@/_components/forms/Button';
import Dot from '@/_components/Dot';
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
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { StadiumSort, StadiumStatusFilter } from '@/_types/stadium';
import StadiumFilters from './_components/StadiumFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: StadiumSort = 'updated_at_desc';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  country_id?: string | string[];
  city_id?: string | string[];
  primary_club_id?: string | string[];
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

function parseUuid(value: QueryParam): string | undefined {
  const parsed = parseString(value);
  return parsed && UUID_PATTERN.test(parsed) ? parsed : undefined;
}

function formatDateOnly(value: string): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function buildHref(
  page: number,
  pageSize: number,
  sort: StadiumSort,
  status?: StadiumStatusFilter,
  countryId?: string,
  cityId?: string,
  primaryClubId?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (countryId) params.set('country_id', countryId);
  if (cityId) params.set('city_id', cityId);
  if (primaryClubId) params.set('primary_club_id', primaryClubId);

  return `${NAVIGATION.STADIUMS}?${params.toString()}`;
}

function renderImagePreview(name: string, imageUrl: string | null) {
  if (!imageUrl) {
    return (
      <span
        aria-label={`No image for ${name}`}
        style={{
          display: 'inline-block',
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#f2f2f2',
        }}
      />
    );
  }

  return (
    <span
      aria-label={`${name} image`}
      style={{
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default async function StadiumsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as StadiumSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as
    | StadiumStatusFilter
    | undefined;
  const countryId = parseUuid(params?.country_id);
  const cityId = parseUuid(params?.city_id);
  const primaryClubId = parseUuid(params?.primary_club_id);

  const [stadiumsResponse, countriesResponse, selectedCity] = await Promise.all([
    getAdminStadiums({
      page,
      pageSize,
      sort,
      status,
      countryId,
      cityId,
      primaryClubId,
    }),
    getAllCountries(),
    cityId ? getCityById(cityId) : Promise.resolve(null),
  ]);

  const uniqueCountryIds = Array.from(
    new Set(
      [countryId, ...stadiumsResponse.data.map(stadium => stadium.countryId)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  const citiesByCountryResponses = await Promise.all(
    uniqueCountryIds.map(async currentCountryId => ({
      countryId: currentCountryId,
      response: await getGeoCitiesByCountry(currentCountryId),
    })),
  );

  const selectedCountryCitiesResponse = countryId
    ? citiesByCountryResponses.find(
        response => response.countryId === countryId,
      )?.response
    : undefined;

  const initialCities = selectedCountryCitiesResponse?.data.map(city => ({
    id: city.id,
    name: city.name,
  })) ?? [];

  const countryLabels = new Map(
    countriesResponse.map(country => [country.id, country.name]),
  );
  const cityLabels = new Map<string, string>();

  for (const { response } of citiesByCountryResponses) {
    for (const city of response.data) {
      cityLabels.set(city.id, city.name);
    }
  }

  const { metadata } = stadiumsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.STADIUMS} icon='stadiums'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_STADIUM}>
          {SECTIONS.ADD_STADIUM}
        </Button>
      </SectionHeader>

      <StadiumFilters
        key={`${sort}-${status ?? 'all'}-${countryId ?? ''}-${cityId ?? ''}-${primaryClubId ?? ''}-${pageSize}`}
        pageSize={pageSize}
        sort={sort}
        status={status}
        countryId={countryId}
        cityId={cityId}
        primaryClubId={primaryClubId}
        countries={countriesResponse}
        initialCities={initialCities}
        initialCitiesError={selectedCountryCitiesResponse?.error?.error ?? null}
        selectedCityLabel={selectedCity?.name ?? cityId}
      />

      {stadiumsResponse.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load stadiums.</Text>
            <Text size='small' color='gray'>
              {resolveStadiumErrorMessage(stadiumsResponse.error)}
            </Text>
          </Grid>
        </Main>
      ) : (
        <>
          <Main>
            <Table>
              <Thead>
                <Row>
                  <Cell header>Image</Cell>
                  <Cell header className='padding-left--16'>
                    Name
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Slug
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Country
                  </Cell>
                  <Cell header className='padding-left--16'>
                    City
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Seats
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Surface
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Primary club
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
                {stadiumsResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No stadiums found for the current filters.</Cell>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Cell
                        key={`none-${index}`}
                        className='padding-left--16'
                      >
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  stadiumsResponse.data.map(stadium => (
                    <Row
                      key={stadium.id}
                      href={NAVIGATION.STADIUM_BY_ID(stadium.id)}
                    >
                      <Cell>{renderImagePreview(stadium.name, stadium.imageUrl)}</Cell>
                      <Cell className='padding-left--16'>{stadium.name}</Cell>
                      <Cell className='padding-left--16'>{stadium.slug}</Cell>
                      <Cell className='padding-left--16'>
                        {stadium.countryId
                          ? (countryLabels.get(stadium.countryId) ?? stadium.countryId)
                          : PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {stadium.cityId
                          ? (cityLabels.get(stadium.cityId) ?? stadium.cityId)
                          : PLACEHOLDER}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {stadium.seatCount?.toLocaleString() ?? PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {stadium.surfaceType ?? PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {stadium.primaryClubId ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {stadium.isActive ? <Dot active inline /> : <Dot inline />}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatDateOnly(stadium.createdAt)}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatDateOnly(stadium.updatedAt)}
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
                    cityId,
                    primaryClubId,
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
                    cityId,
                    primaryClubId,
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
