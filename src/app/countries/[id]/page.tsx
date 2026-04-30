/** @format */

import Box from '@/_components/layout/Box';
import Button from '@/_components/forms/Button';
import Dot from '@/_components/Dot';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getAdminCities } from '@/_actions/city/getCities';
import { getAdminCountryById } from '@/_actions/country/getCountryById';
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import { resolveCountryErrorMessage } from '@/_constants/countryErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CountryActivationToggle from '../_components/CountryActivationToggle';
import CountryForm from '../_components/CountryForm';

const PLACEHOLDER = '--';

type CountryDetailsPageParams = Readonly<{
  id?: string;
}>;

type CountryDetailsPageProps = Readonly<{
  params?: Promise<CountryDetailsPageParams> | CountryDetailsPageParams;
}>;

function formatCoordinate(value: number | null): string {
  return value !== null ? value.toFixed(4) : PLACEHOLDER;
}

function formatTextValue(value: string | null): string {
  if (!value) return PLACEHOLDER;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER;
}

function renderUnavailable(message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>Country unavailable</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.COUNTRIES}>Back to countries</Button>
      </Grid>
    </Main>
  );
}

export default async function CountryDetailsPage({
  params,
}: CountryDetailsPageProps = {}) {
  await requireAdminAccess();

  const resolvedParams = await Promise.resolve(params);
  const countryId = resolvedParams?.id;

  if (!countryId) {
    return renderUnavailable('Missing country identifier in the URL.');
  }

  const [countryResponse, citiesResponse] = await Promise.all([
    getAdminCountryById(countryId),
    getAdminCities({
      countryId,
      page: 1,
      pageSize: 100,
      sort: 'updated_at_desc',
      status: 'all',
    }),
  ]);

  if (!countryResponse.data) {
    return renderUnavailable(resolveCountryErrorMessage(countryResponse.error));
  }

  const country = countryResponse.data;

  return (
    <Grid gap={32}>
      <SectionHeader
        title={`${SECTIONS.COUNTRIES} / ${country.name}`}
        icon='countries'
      >
        <Box display='flex' gap={4} alignItems='center'>
          <CountryActivationToggle
            countryId={country.id}
            isActive={country.isActive}
          />
          <Button href={NAVIGATION.COUNTRIES}>All countries</Button>
          <Button icon='locationAdd' href={NAVIGATION.CREATE_A_CITY(country.id)}>
            Create a city
          </Button>
        </Box>
      </SectionHeader>

      <CountryForm country={country} edit />

      <Section>
        <SectionHeader title={SECTIONS.CITIES} icon='cities' />

        {citiesResponse.error ? (
          <Grid gap={8}>
            <Text weight='bold'>We could not load cities.</Text>
            <Text size='small' color='gray'>
              {resolveCityErrorMessage(citiesResponse.error)}
            </Text>
          </Grid>
        ) : (
          <Table>
            <Thead>
              <Row>
                <Cell header>Name</Cell>
                <Cell header className='padding-left--16'>Slug</Cell>
                <Cell header className='padding-left--16'>
                  Translation key
                </Cell>
                <Cell header className='padding-left--16'>Region</Cell>
                <Cell header className='padding-left--16'>Province</Cell>
                <Cell header className='padding-left--16' align='right'>
                  Lat
                </Cell>
                <Cell header className='padding-left--16' align='right'>
                  Lng
                </Cell>
                <Cell header className='padding-left--16' align='center'>
                  Active
                </Cell>
              </Row>
            </Thead>
            <Tbody>
              {citiesResponse.data.length === 0 ? (
                <Row>
                  <Cell>No cities available yet.</Cell>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Cell key={`none-${index}`} className='padding-left--16'>
                      {PLACEHOLDER}
                    </Cell>
                  ))}
                </Row>
              ) : (
                citiesResponse.data.map(city => (
                  <Row href={NAVIGATION.CITY_BY_ID(city.id)} key={city.id}>
                    <Cell>{city.name}</Cell>
                    <Cell className='padding-left--16'>{city.slug}</Cell>
                    <Cell className='padding-left--16'>
                      {city.translationKey}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatTextValue(city.regionName)}
                    </Cell>
                    <Cell className='padding-left--16'>
                      {formatTextValue(city.provinceName)}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatCoordinate(city.latitude)}
                    </Cell>
                    <Cell align='right' className='padding-left--16'>
                      {formatCoordinate(city.longitude)}
                    </Cell>
                    <Cell align='center' className='padding-left--16'>
                      {city.isActive ? <Dot active inline /> : <Dot inline />}
                    </Cell>
                  </Row>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Section>
    </Grid>
  );
}
