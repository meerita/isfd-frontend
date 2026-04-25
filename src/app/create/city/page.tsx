/** @format */

import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import { getAllCountries } from '@/_actions/country/getAllCountries';

import CityForm from '../../cities/_components/CityForm';

type CreateCityPageProps = Readonly<{
  searchParams?: Promise<{ country?: string }> | { country?: string };
}>;

const normalizeCountryCode = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
};

export default async function CreateCityPage({
  searchParams,
}: CreateCityPageProps = {}) {
  const resolvedSearch = await Promise.resolve(searchParams);
  const initialCountryCode = normalizeCountryCode(resolvedSearch?.country);
  const countries = await getAllCountries();
  // `selectedCountry` intentionally unused — keep initialCountryCode for CityForm

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities' />
      <Grid gap={8}>
        <Title size='medium'>Create a new city</Title>
      </Grid>
      <CityForm countries={countries} initialCountryCode={initialCountryCode} />
    </Grid>
  );
}
