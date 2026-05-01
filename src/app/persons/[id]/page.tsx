/** @format */

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminPersonById } from '@/_actions/person/getAdminPersonById';
import { getPublicPersonBySlug } from '@/_actions/person/getPublicPersonBySlug';
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
  const publicPersonResponse = person.slug
    ? await getPublicPersonBySlug(person.slug)
    : { data: null, error: undefined };
  const publicPerson = publicPersonResponse.data;
  const selectedPrimaryNationalityCountryLabel =
    countries.find(country => country.id === person.primary_nationality_country_id)
      ?.name ?? null;
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
          <PersonActivationToggle personId={person.id} isActive={person.is_active} />
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
            publicPerson={publicPerson}
            section={section}
            edit={edit}
            countries={countries}
            selectedPrimaryNationalityCountryLabel={
              selectedPrimaryNationalityCountryLabel
            }
            cancelHref={detailHref}
            successHref={detailHref}
          />
        </Grid>
      </Main>
    </Grid>
  );
}
