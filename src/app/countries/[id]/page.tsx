/** @format */

import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getCountryById } from '@/_actions/country/getCountryById';
import SECTIONS from '@/_constants/sections';
import SectionHeader from '@/_components/layout/SectionHeader';
import Button from '@/_components/forms/Button';
import CountryForm from '../_components/CountryForm';
import Section from '@/_components/layout/Section';
import Table from '@/_components/tables/Table';
import Thead from '@/_components/tables/Thead';
import Row from '@/_components/tables/Row';
import Cell from '@/_components/tables/Cell';
import Tbody from '@/_components/tables/Tbody';
import type { City } from '@/_types/city';
import NAVIGATION from '@/_constants/navigation';
import Link from 'next/link';
import Icon from '@/_components/Icon';
import Dot from '@/_components/Dot';
import { getCities } from '@/_actions/city/getCities';
import { extractCities } from '@/_helpers/extractCities';
import LastUpdated from '@/_components/forms/LastUpdated';
import Box from '@/_components/layout/Box';

const PLACEHOLDER_VALUE = '--';
const CITY_DEFAULT_PAGE = 1;
const CITY_DEFAULT_LIMIT = 100;

type CountryDetailsPageParams = Readonly<{
  id?: string;
}>;

type CountryDetailsPageProps = Readonly<{
  params?: Promise<CountryDetailsPageParams> | CountryDetailsPageParams;
  searchParams?: Promise<CitySearchParams> | CitySearchParams;
}>;

type CitySearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
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

function formatCoordinate(value?: number): string {
  if (typeof value === 'number') {
    return value.toFixed(4);
  }

  return PLACEHOLDER_VALUE;
}

function formatTextValue(value?: string): string {
  if (!value) {
    return PLACEHOLDER_VALUE;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_VALUE;
}

function getCityLatitude(city: City): number | undefined {
  return city.coordinates?.lat ?? city.latitude;
}

function getCityLongitude(city: City): number | undefined {
  return city.coordinates?.lng ?? city.longitude;
}

function buildCitiesPageHref(
  countryId: string,
  page: number,
  limit: number,
): string {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  return `${NAVIGATION.COUNTRY_BY_ID(countryId)}?${params.toString()}`;
}

function renderNotFound(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>Country unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
      </Grid>
    </Main>
  );
}

export default async function CountryDetailsPage({
  params,
  searchParams,
}: CountryDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const requestedCityPage = parsePositiveInteger(
    resolvedSearchParams?.page,
    CITY_DEFAULT_PAGE,
  );
  const requestedCityLimit = parsePositiveInteger(
    resolvedSearchParams?.limit,
    CITY_DEFAULT_LIMIT,
  );
  const countryId = resolvedParams?.id;

  if (!countryId) {
    return renderNotFound('Missing country identifier in the URL.');
  }

  const country = await getCountryById(countryId);

  if (!country) {
    return renderNotFound('We could not find this country.');
  }

  const citiesResponse = await getCities({
    countryCode: country.countryCode,
    page: requestedCityPage,
    limit: requestedCityLimit,
  });
  const cityPagination = citiesResponse.pagination;
  const cityCurrentPage = Math.max(1, cityPagination.page ?? requestedCityPage);
  const cityTotalPages = Math.max(1, cityPagination.totalPages ?? 1);
  const cityCurrentLimit = Math.max(
    1,
    cityPagination.limit ?? requestedCityLimit,
  );
  const hasCityPreviousPage = cityCurrentPage > 1;
  const hasCityNextPage = cityCurrentPage < cityTotalPages;
  const previousCitiesHref = hasCityPreviousPage
    ? buildCitiesPageHref(countryId, cityCurrentPage - 1, cityCurrentLimit)
    : null;
  const nextCitiesHref = hasCityNextPage
    ? buildCitiesPageHref(countryId, cityCurrentPage + 1, cityCurrentLimit)
    : null;
  const cities = extractCities(citiesResponse.data);

  return (
    <Grid gap={32}>
      <SectionHeader
        title={`${SECTIONS.COUNTRIES} / ${country.name}`}
        icon='countries'
      >
        <Box display='flex' gap={4} alignItems='center'>
          <LastUpdated date={new Date(country.updatedAt)} />
          <Button icon='countryAdd' href={NAVIGATION.COUNTRIES}>
            All countries
          </Button>
          <Button
            icon='locationAdd'
            href={NAVIGATION.CREATE_A_CITY(country.countryCode)}
          >
            Create a City
          </Button>
        </Box>
      </SectionHeader>

      <CountryForm
        key={country.id}
        country={country}
        provinces={country.provinces}
        edit
      />

      <Section>
        <SectionHeader title={SECTIONS.CITIES} icon='cities' />
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header className='padding-left--16' align='center'>
                Capital
              </Cell>
              <Cell header className='padding-left--16'>
                Province
              </Cell>
              <Cell header className='padding-left--16' align='right'>
                Latitude
              </Cell>
              <Cell header className='padding-left--16' align='right'>
                Longitude
              </Cell>
            </Row>
          </Thead>
          <Tbody>
            {cities.length === 0 ? (
              <Row>
                <Cell>No cities available yet.</Cell>
                <Cell align='center' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
                <Cell className='padding-left--16'>{PLACEHOLDER_VALUE}</Cell>
                <Cell align='right' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
                <Cell align='right' className='padding-left--16'>
                  {PLACEHOLDER_VALUE}
                </Cell>
              </Row>
            ) : (
              cities.map(city => (
                <Row href={NAVIGATION.CITY_BY_ID(city.id)} key={city.id}>
                  <Cell>{city.name}</Cell>
                  <Cell align='center' className='padding-left--16'>
                    {city.capital ? <Dot active inline /> : <Dot inline />}
                  </Cell>
                  <Cell className='padding-left--16'>
                    {formatTextValue(city.province)}
                  </Cell>
                  <Cell align='right' className='padding-left--16'>
                    {formatCoordinate(getCityLatitude(city))}
                  </Cell>
                  <Cell align='right' className='padding-left--16'>
                    {formatCoordinate(getCityLongitude(city))}
                  </Cell>
                </Row>
              ))
            )}
          </Tbody>
        </Table>
        <Grid justifyItems='center' className='margin-block--16'>
          <Grid gap={16} display='flex' alignItems='center'>
            {hasCityPreviousPage ? (
              <Link href={previousCitiesHref!} aria-label='Go to previous page'>
                <Icon name='arrowLeft' size={24} fill='gray' />
              </Link>
            ) : null}
            <Text color='gray' size='small' weight='semibold'>
              Page {cityCurrentPage} of {cityTotalPages}
            </Text>
            {hasCityNextPage ? (
              <Link href={nextCitiesHref!} aria-label='Go to next page'>
                <Icon name='arrowRight' size={24} fill='gray' />
              </Link>
            ) : null}
          </Grid>
        </Grid>
      </Section>
    </Grid>
  );
}
