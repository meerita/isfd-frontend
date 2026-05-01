/** @format */
/**
 * @file src/app/persons/[id]/page.tsx
 * @description Renders the person detail page shell with localized actions and navigation.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import { getDictionary } from '../../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../../_i18n/resolveRequestLocale';
import PersonInformationTab from '../_components/PersonInformationTab';
import PersonSidebarNavigation from '../_components/PersonSideBar';

type PersonPageParams = Readonly<{
  id: string;
}>;

type PersonPageSearchParams = Readonly<{
  value?: string | string[];
  id?: string | string[];
  section?: string | string[];
  edit?: string | string[];
}>;

type PersonPageProps = Readonly<{
  params: Promise<PersonPageParams> | PersonPageParams;
  searchParams?: Promise<PersonPageSearchParams> | PersonPageSearchParams;
}>;

export default async function PersonPage({
  params,
  searchParams,
}: PersonPageProps): Promise<React.JSX.Element> {
  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const personIdSlug = resolvedParams?.id?.trim() ?? '';

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: dictionary.navigation.persons, href: NAVIGATION.PERSONS },
          { label: 'Lionel Messi' },
        ]}
        icon='users'
      >
        <ButtonGroup gap={4}>
          <Button icon='remove' type='button' variant='borderless'>
            {dictionary.persons.detail.deletePerson}
          </Button>
          <Button
            icon='visibility'
            type='button'
            href={`?value=${personIdSlug}&section=profile&edit=true`}
          >
            {dictionary.persons.detail.makeActive}
          </Button>
          <Button
            icon='visibility'
            type='button'
            href={`?value=${personIdSlug}&section=profile&edit=true`}
          >
            {dictionary.persons.detail.makeInactive}
          </Button>
        </ButtonGroup>
      </SectionHeader>
      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <PersonSidebarNavigation person={{ id: personIdSlug } as never} />
          <PersonInformationTab person={{ id: personIdSlug } as never} />
        </Grid>
      </Main>
    </Grid>
  );
}
