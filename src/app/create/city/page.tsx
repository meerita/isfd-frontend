/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminProvincesByCountryId } from '@/_actions/country/getAdminProvincesByCountryId';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Title from '@/_components/typography/Title';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CityForm from '../../cities/_components/CityForm';

type SearchParams = Readonly<{
  country_id?: string | string[];
  countryId?: string | string[];
}>;

function parseString(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export default async function CreateCityPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const resolvedSearchParams = await searchParams;
  const initialCountryId =
    parseString(resolvedSearchParams?.country_id) ??
    parseString(resolvedSearchParams?.countryId);
  const [countries, initialProvinces] = await Promise.all([
    getAllCountries(),
    initialCountryId
      ? getAdminProvincesByCountryId(initialCountryId)
      : Promise.resolve([]),
  ]);

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.CITIES} icon='cities' />
      <Grid gap={8}>
        <Title size='medium'>Create a new city</Title>
      </Grid>
      <CityForm
        countries={countries}
        initialCountryId={initialCountryId}
        initialProvinces={initialProvinces}
      />
    </Grid>
  );
}
