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
import NAVIGATION from '@/_constants/navigation';
import Icon from '@/_components/Icon';
import Dot from '@/_components/Dot';
import { getCities } from '@/_actions/city/getCities';
import Box from '@/_components/layout/Box';
import CountryActivationToggle from '../_components/CountryActivationToggle';

const PLACEHOLDER_VALUE = '--';

type CountryDetailsPageParams = Readonly<{
  id?: string;
}>;

type CountryDetailsPageProps = Readonly<{
  params?: Promise<CountryDetailsPageParams> | CountryDetailsPageParams;
}>;

function formatCoordinate(value: number | null): string {
  if (value !== null) {
    return value.toFixed(4);
  }
  return PLACEHOLDER_VALUE;
}

function formatTextValue(value: string | null): string {
  if (!value) return PLACEHOLDER_VALUE;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_VALUE;
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
}: CountryDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const countryId = resolvedParams?.id;

  if (!countryId) {
    return renderNotFound('Missing country identifier in the URL.');
  }

  const country = await getCountryById(countryId);

  if (!country) {
    return renderNotFound('We could not find this country.');
  }

  const citiesResponse = await getCities({ countryId: country.id });
  const cities = citiesResponse.data;

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
          <Button icon='countryAdd' href={NAVIGATION.COUNTRIES}>
            All countries
          </Button>
          <Button
            icon='locationAdd'
            href={NAVIGATION.CREATE_A_CITY(country.id)}
          >
            Create a City
          </Button>
        </Box>
      </SectionHeader>

      <CountryForm
        key={country.id}
        country={country}
        edit
      />

      <Section>
        <SectionHeader title={SECTIONS.CITIES} icon='cities' />
        <Table>
          <Thead>
            <Row>
              <Cell header>Name</Cell>
              <Cell header className='padding-left--16'>
                Slug
              </Cell>
              <Cell header className='padding-left--16'>
                Translation key
              </Cell>
              <Cell header className='padding-left--16'>
                Region
              </Cell>
              <Cell header className='padding-left--16'>
                Province
              </Cell>
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
            {cities.length === 0 ? (
              <Row>
                <Cell>No cities available yet.</Cell>
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
                <Cell className='padding-left--16' />
              </Row>
            ) : (
              cities.map(city => (
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
      </Section>
    </Grid>
  );
}
