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
import { resolveLocalizedClubErrorMessage } from '@/_constants/clubErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import ClubInformationTab, {
  type ClubSection,
} from '../_components/ClubInformationTab';
import DeleteClubButton from '../_components/DeleteClubButton';
import ClubSidebarNavigation from '../_components/ClubSideBar';
import ClubUnavailable from '../_components/ClubUnavailable';

type ClubPageParams = Readonly<{
  id: string;
}>;

type ClubPageSearchParams = Readonly<{
  section?: string | string[];
  edit?: string | string[];
}>;

type ClubDetailsPageProps = Readonly<{
  params: Promise<ClubPageParams> | ClubPageParams;
  searchParams?: Promise<ClubPageSearchParams> | ClubPageSearchParams;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): ClubSection {
  switch (value) {
    case 'media':
    case 'persons':
    case 'championships':
    case 'games':
    case 'achievements':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildClubHref(clubId: string, section: ClubSection, edit?: boolean): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (edit) {
    params.set('edit', 'true');
  }

  return `${NAVIGATION.CLUB_BY_ID(clubId)}?${params.toString()}`;
}

export default async function ClubDetailsPage({
  params,
  searchParams,
}: ClubDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const clubId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!clubId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.clubs }]}
          icon='club'
        />
        <ClubUnavailable message={dictionary.clubs.errors.CLUB_ID_REQUIRED} />
      </Grid>
    );
  }

  const [clubResponse, countries] = await Promise.all([
    getAdminClubById(clubId),
    getAllCountries(),
  ]);

  if (!clubResponse.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.clubs, href: NAVIGATION.CLUBS }]}
          icon='club'
        />
        <ClubUnavailable
          message={resolveLocalizedClubErrorMessage(
            clubResponse.error,
            dictionary.clubs.errors,
            dictionary.common.unexpectedError,
          )}
        />
      </Grid>
    );
  }

  const club = clubResponse.data;
  const selectedCountry = countries.find(country => country.id === club.countryId);
  const [selectedCity, selectedPrimaryStadium] = await Promise.all([
    club.cityId ? getCityById(club.cityId) : Promise.resolve(null),
    club.primaryStadiumId
      ? getAdminStadiumById(club.primaryStadiumId)
      : Promise.resolve({ data: null }),
  ]);
  const initialProvinceName = selectedCity?.provinceName ?? null;
  const initialCities =
    club.countryId && initialProvinceName
      ? await getAdminCitiesByCountryIdAndProvince(
          club.countryId,
          initialProvinceName,
        )
      : [];
  const detailHref = buildClubHref(club.id, section);
  const editHref = buildClubHref(club.id, section, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.clubs, href: NAVIGATION.CLUBS },
          { label: club.name },
        ]}
        icon='club'
      >
        <ButtonGroup gap={4}>
          <DeleteClubButton clubId={club.id} clubSlug={club.slug} clubName={club.name} />
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
          <ClubSidebarNavigation clubId={club.id} activeSection={section} />
          <ClubInformationTab
            club={club}
            section={section}
            edit={edit}
            countries={countries}
            initialProvinceName={initialProvinceName}
            initialCities={initialCities}
            selectedCountryLabel={selectedCountry?.name ?? club.countryId}
            selectedCityLabel={selectedCity?.name ?? club.cityId}
            selectedPrimaryStadiumLabel={
              selectedPrimaryStadium.data?.name ?? club.primaryStadiumId
            }
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
