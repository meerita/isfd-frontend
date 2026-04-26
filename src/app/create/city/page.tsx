/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import { getAllCountries } from '@/_actions/country/getAllCountries';

import CityForm from '../../cities/_components/CityForm';

type CreateCityPageProps = Readonly<{
  searchParams?: Promise<{ countryId?: string }> | { countryId?: string };
}>;

export default async function CreateCityPage({
  searchParams,
}: CreateCityPageProps = {}) {
  const resolvedSearch = await Promise.resolve(searchParams);
  const initialCountryId = resolvedSearch?.countryId?.trim() || null;
  const countries = await getAllCountries();

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities' />
      <Grid gap={8}>
        <Title size='medium'>Create a new city</Title>
      </Grid>
      <CityForm countries={countries} initialCountryId={initialCountryId} />
    </Grid>
  );
}
