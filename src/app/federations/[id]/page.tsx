/** @format */

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminFederationById } from '@/_actions/federation/getAdminFederationById';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedFederationErrorMessage } from '@/_constants/federationErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import DeleteFederationButton from '../_components/DeleteFederationButton';
import FederationInformationTab, {
  type FederationSection,
} from '../_components/FederationInformationTab';
import FederationSidebarNavigation from '../_components/FederationSideBar';
import FederationUnavailable from '../_components/FederationUnavailable';

type FederationPageParams = Readonly<{
  id: string;
}>;

type FederationPageSearchParams = Readonly<{
  section?: string | string[];
  edit?: string | string[];
}>;

type FederationDetailsPageProps = Readonly<{
  params: Promise<FederationPageParams> | FederationPageParams;
  searchParams?: Promise<FederationPageSearchParams> | FederationPageSearchParams;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): FederationSection {
  switch (value) {
    case 'media':
    case 'teams':
    case 'championships':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildFederationHref(
  federationId: string,
  section: FederationSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (edit) {
    params.set('edit', 'true');
  }

  return `${NAVIGATION.FEDERATION_BY_ID(federationId)}?${params.toString()}`;
}

export default async function FederationDetailsPage({
  params,
  searchParams,
}: FederationDetailsPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const federationId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!federationId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.federations }]}
          icon='admin'
        />
        <FederationUnavailable
          message={dictionary.federations.errors.FEDERATION_NOT_FOUND}
        />
      </Grid>
    );
  }

  const federationResponse = await getAdminFederationById(federationId);
  if (!federationResponse.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            {
              label: dictionary.navigation.federations,
              href: NAVIGATION.FEDERATIONS,
            },
          ]}
          icon='admin'
        />
        <FederationUnavailable
          message={resolveLocalizedFederationErrorMessage(
            federationResponse.error,
            dictionary.federations.errors,
            dictionary.common.unexpectedError,
          )}
        />
      </Grid>
    );
  }

  const federation = federationResponse.data;
  const countries = await getAllCountries();
  const selectedCountry = countries.find(
    country => country.id === federation.countryId,
  );
  const citiesResponse = federation.countryId
    ? await getGeoCitiesByCountry(federation.countryId)
    : { data: [], error: undefined };
  const selectedCity = citiesResponse.data.find(
    city => city.id === federation.cityId,
  );
  const detailHref = buildFederationHref(federation.id, section);
  const editHref = buildFederationHref(federation.id, section, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.federations, href: NAVIGATION.FEDERATIONS },
          { label: federation.name },
        ]}
        icon='admin'
      >
        <ButtonGroup gap={4}>
          <DeleteFederationButton
            federationId={federation.id}
            federationName={federation.name}
          />
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
          <FederationSidebarNavigation
            federationId={federation.id}
            activeSection={section}
          />
          <FederationInformationTab
            federation={federation}
            section={section}
            edit={edit}
            countries={countries}
            initialCities={citiesResponse.data}
            selectedCountryLabel={selectedCountry?.name ?? federation.countryId}
            selectedCityLabel={selectedCity?.name ?? federation.cityId}
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
