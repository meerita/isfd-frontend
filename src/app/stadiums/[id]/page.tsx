/** @format */

import { getAdminClubById } from '@/_actions/club/getAdminClubById';
import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { getCityById } from '@/_actions/city/getCityById';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminStadiumById } from '@/_actions/stadium/getAdminStadiumById';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import DeleteStadiumButton from '../_components/DeleteStadiumButton';
import StadiumInformationTab, {
  type StadiumSection,
} from '../_components/StadiumInformationTab';
import StadiumSidebarNavigation from '../_components/StadiumSideBar';
import StadiumUnavailable from '../_components/StadiumUnavailable';

type StadiumPageParams = Readonly<{
  id: string;
}>;

type StadiumPageSearchParams = Readonly<{
  section?: string | string[];
  edit?: string | string[];
}>;

type StadiumDetailsPageProps = Readonly<{
  params: Promise<StadiumPageParams> | StadiumPageParams;
  searchParams?: Promise<StadiumPageSearchParams> | StadiumPageSearchParams;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): StadiumSection {
  switch (value) {
    case 'media':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildStadiumHref(
  stadiumId: string,
  section: StadiumSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (edit) {
    params.set('edit', 'true');
  }

  return `${NAVIGATION.STADIUM_BY_ID(stadiumId)}?${params.toString()}`;
}

export default async function StadiumDetailsPage({
  params,
  searchParams,
}: StadiumDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const stadiumId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!stadiumId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.stadiums }]}
          icon='stadiums'
        />
        <StadiumUnavailable message={dictionary.stadiums.errors.STADIUM_ID_REQUIRED} />
      </Grid>
    );
  }

  const [stadiumResponse, countries] = await Promise.all([
    getAdminStadiumById(stadiumId),
    getAllCountries(),
  ]);

  if (!stadiumResponse.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: dictionary.navigation.stadiums, href: NAVIGATION.STADIUMS },
          ]}
          icon='stadiums'
        />
        <StadiumUnavailable
          message={resolveLocalizedStadiumErrorMessage(
            stadiumResponse.error,
            dictionary.stadiums.errors,
            dictionary.common.unexpectedError,
          )}
        />
      </Grid>
    );
  }

  const stadium = stadiumResponse.data;
  const selectedCountry = countries.find(country => country.id === stadium.countryId);
  const [selectedCity, selectedPrimaryClub] = await Promise.all([
    stadium.cityId ? getCityById(stadium.cityId) : Promise.resolve(null),
    stadium.primaryClubId
      ? getAdminClubById(stadium.primaryClubId)
      : Promise.resolve({ data: null }),
  ]);
  const initialProvinceName = selectedCity?.provinceName ?? null;
  const initialCities =
    stadium.countryId && initialProvinceName
      ? await getAdminCitiesByCountryIdAndProvince(
          stadium.countryId,
          initialProvinceName,
        )
      : [];
  const detailHref = buildStadiumHref(stadium.id, section);
  const editHref = buildStadiumHref(stadium.id, section, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.stadiums, href: NAVIGATION.STADIUMS },
          { label: stadium.name },
        ]}
        icon='stadiums'
      >
        <ButtonGroup gap={4}>
          <DeleteStadiumButton stadiumId={stadium.id} stadiumName={stadium.name} />
          <Button
            icon='edit'
            type='button'
            href={edit ? detailHref : editHref}
            variant={edit ? 'borderless' : 'solid'}
          >
            {edit ? dictionary.common.cancel : dictionary.common.edit}
          </Button>
        </ButtonGroup>
      </SectionHeader>
      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <StadiumSidebarNavigation stadiumId={stadium.id} activeSection={section} />
          <StadiumInformationTab
            stadium={stadium}
            section={section}
            edit={edit}
            countries={countries}
            initialProvinceName={initialProvinceName}
            initialCities={initialCities}
            selectedCountryLabel={selectedCountry?.name ?? stadium.countryId}
            selectedCityLabel={selectedCity?.name ?? stadium.cityId}
            selectedPrimaryClubLabel={
              selectedPrimaryClub.data?.name ?? stadium.primaryClubId
            }
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
