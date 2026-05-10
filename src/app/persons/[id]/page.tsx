/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminCitiesByCountryIdAndProvince } from '@/_actions/city/getCities';
import { getCityById } from '@/_actions/city/getCityById';
import { getAdminPersonById } from '@/_actions/person/getAdminPersonById';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import DeletePersonButton from '../_components/DeletePersonButton';
import PersonActivationToggle from '../_components/PersonActivationToggle';
import PersonInformationTab, {
  type PersonSection,
} from '../_components/PersonInformationTab';
import PersonSidebarNavigation from '../_components/PersonSideBar';
import PersonUnavailable from '../_components/PersonUnavailable';

type PersonPageParams = Readonly<{
  id: string;
}>;

type PersonPageSearchParams = Readonly<{
  section?: string | string[];
  edit?: string | string[];
}>;

type PersonPageProps = Readonly<{
  params: Promise<PersonPageParams> | PersonPageParams;
  searchParams?: Promise<PersonPageSearchParams> | PersonPageSearchParams;
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): PersonSection {
  switch (value) {
    case 'media':
    case 'clubs':
    case 'games':
    case 'achievements':
      return value;
    case 'profile':
    default:
      return 'profile';
  }
}

function buildPersonHref(
  personId: string,
  section: PersonSection,
  edit?: boolean,
): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (edit) {
    params.set('edit', 'true');
  }

  return `${NAVIGATION.PERSON_BY_ID(personId)}?${params.toString()}`;
}

export default async function PersonPage({
  params,
  searchParams,
}: PersonPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const personId = resolvedParams?.id?.trim() ?? '';
  const section = parseSection(extractSingleValue(resolvedSearchParams?.section));
  const edit = extractSingleValue(resolvedSearchParams?.edit) === 'true';

  if (!personId) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[{ label: dictionary.navigation.persons }]}
          icon='person'
        />
        <PersonUnavailable message={dictionary.persons.errors.PERSON_ID_REQUIRED} />
      </Grid>
    );
  }

  const [personResponse, countries] = await Promise.all([
    getAdminPersonById(personId),
    getAllCountries(),
  ]);

  if (!personResponse.data) {
    return (
      <Grid gap={16}>
        <SectionHeader
          navigation={[
            { label: dictionary.navigation.persons, href: NAVIGATION.PERSONS },
          ]}
          icon='person'
        />
        <PersonUnavailable
          message={resolvePersonErrorMessage(
            personResponse.error,
            dictionary.persons.errors,
            dictionary.common.unexpectedError,
          )}
        />
      </Grid>
    );
  }

  const person = personResponse.data;
  const selectedPrimaryNationalityCountryLabel =
    countries.find(country => country.id === person.primary_nationality_country_id)
      ?.name ?? null;
  const [birthCity, currentCity] = await Promise.all([
    person.birth_location_id
      ? getCityById(person.birth_location_id)
      : Promise.resolve(null),
    person.current_city_id ? getCityById(person.current_city_id) : Promise.resolve(null),
  ]);
  const [initialBirthCities, initialCurrentCities] = await Promise.all([
    birthCity?.countryId && birthCity.provinceName
      ? getAdminCitiesByCountryIdAndProvince(
          birthCity.countryId,
          birthCity.provinceName,
        )
      : Promise.resolve([]),
    currentCity?.countryId && currentCity.provinceName
      ? getAdminCitiesByCountryIdAndProvince(
          currentCity.countryId,
          currentCity.provinceName,
        )
      : Promise.resolve([]),
  ]);
  const detailHref = buildPersonHref(person.id, section);
  const editHref = buildPersonHref(person.id, section, true);

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.persons, href: NAVIGATION.PERSONS },
          { label: person.full_name },
        ]}
        icon='person'
      >
        <ButtonGroup gap={4}>
          <DeletePersonButton personId={person.id} personName={person.full_name} />
          <PersonActivationToggle personId={person.id} isPublic={person.is_public} />
          <Button
            icon='personEdit'
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
          <PersonSidebarNavigation personId={person.id} activeSection={section} />
          <PersonInformationTab
            person={person}
            section={section}
            edit={edit}
            countries={countries}
            selectedPrimaryNationalityCountryLabel={
              selectedPrimaryNationalityCountryLabel
            }
            initialBirthLocation={
              birthCity
                ? {
                    countryId: birthCity.countryId,
                    countryLabel:
                      birthCity.countryName ??
                      countries.find(country => country.id === birthCity.countryId)?.name ??
                      birthCity.countryId,
                    provinceName: birthCity.provinceName,
                    cityId: birthCity.id,
                    cityLabel: birthCity.name,
                    initialCities: initialBirthCities,
                  }
                : person.birth_location_id
                  ? {
                      cityId: person.birth_location_id,
                      cityLabel: person.birth_location_id,
                    }
                  : undefined
            }
            initialCurrentLocation={
              currentCity
                ? {
                    countryId: currentCity.countryId,
                    countryLabel:
                      currentCity.countryName ??
                      countries.find(
                        country => country.id === currentCity.countryId,
                      )?.name ??
                      currentCity.countryId,
                    provinceName: currentCity.provinceName,
                    cityId: currentCity.id,
                    cityLabel: currentCity.name,
                    initialCities: initialCurrentCities,
                  }
                : person.current_city_id
                  ? {
                      cityId: person.current_city_id,
                      cityLabel: person.current_city_id,
                    }
                  : undefined
            }
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
