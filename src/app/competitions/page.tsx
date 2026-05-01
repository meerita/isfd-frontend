/** @format */

import { getAdminCompetitionTypes } from '@/_actions/competitionType/getAdminCompetitionTypes';
import { getAdminCompetitions } from '@/_actions/competition/getAdminCompetitions';
import { getAdminCompetitionEditions } from '@/_actions/competitionEdition/getAdminCompetitionEditions';
import { getAdminSeasons } from '@/_actions/season/getAdminSeasons';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Card from '@/_components/Card';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import CompetitionOverviewCard from './_components/CompetitionOverviewCard';
import EntitySidebarNavigation from './_components/EntitySidebarNavigation';

type CompetitionsOverviewSection =
  | 'overview'
  | 'types'
  | 'competitions'
  | 'seasons'
  | 'editions';

type CompetitionsOverviewPageProps = Readonly<{
  searchParams?: Promise<{ section?: string | string[] }> | { section?: string | string[] };
}>;

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionsOverviewSection {
  switch (value) {
    case 'types':
    case 'competitions':
    case 'seasons':
    case 'editions':
      return value;
    case 'overview':
    default:
      return 'overview';
  }
}

function buildCompetitionsHref(section: CompetitionsOverviewSection): string {
  const params = new URLSearchParams();
  params.set('section', section);
  return `${NAVIGATION.COMPETITIONS}?${params.toString()}`;
}

function renderSectionContent(
  section: CompetitionsOverviewSection,
  counts: Readonly<{
    types: number;
    competitions: number;
    seasons: number;
    editions: number;
  }>,
): React.JSX.Element {
  if (section === 'overview') {
    return (
      <Grid gap={24}>
        <Grid gap={8}>
          <Title size='medium'>Competitions</Title>
          <Text color='gray'>
            Manage competition types, competitions, seasons, and competition editions
            from a single section.
          </Text>
        </Grid>

        <Grid columns={4} gap={16}>
          <CompetitionOverviewCard
            href={NAVIGATION.COMPETITION_TYPES}
            title='Competition Types'
            description='Configure classification rules and participant scopes.'
            count={`${counts.types} total`}
          />
          <CompetitionOverviewCard
            href={NAVIGATION.COMPETITIONS_LIST}
            title='Competitions'
            description='Manage base competitions and their classification.'
            count={`${counts.competitions} total`}
          />
          <CompetitionOverviewCard
            href={NAVIGATION.COMPETITION_SEASONS}
            title='Seasons'
            description='Keep yearly season catalogs aligned with editions.'
            count={`${counts.seasons} total`}
          />
          <CompetitionOverviewCard
            href={NAVIGATION.COMPETITION_EDITIONS}
            title='Competition Editions'
            description='Track concrete editions, timing, code, and lifecycle status.'
            count={`${counts.editions} total`}
          />
        </Grid>
      </Grid>
    );
  }

  const sectionConfig: Readonly<
    Record<
      Exclude<CompetitionsOverviewSection, 'overview'>,
      Readonly<{
        title: string;
        description: string;
        href: string;
        count: number;
        ctaLabel: string;
      }>
    >
  > = {
    types: {
      title: 'Competition Types',
      description: 'Open the competition types section to manage configuration entities, filters, and detail pages.',
      href: NAVIGATION.COMPETITION_TYPES,
      count: counts.types,
      ctaLabel: 'Open competition types',
    },
    competitions: {
      title: 'Competitions',
      description: 'Open the competitions list to manage base competitions, relations, and edition links.',
      href: NAVIGATION.COMPETITIONS_LIST,
      count: counts.competitions,
      ctaLabel: 'Open competitions',
    },
    seasons: {
      title: 'Seasons',
      description: 'Open the seasons list to manage catalog seasons and their details.',
      href: NAVIGATION.COMPETITION_SEASONS,
      count: counts.seasons,
      ctaLabel: 'Open seasons',
    },
    editions: {
      title: 'Competition Editions',
      description: 'Open the competition editions list to manage relations, lifecycle status, and code updates.',
      href: NAVIGATION.COMPETITION_EDITIONS,
      count: counts.editions,
      ctaLabel: 'Open competition editions',
    },
  };

  const currentSection = sectionConfig[section];

  return (
    <Card>
      <Grid gap={24}>
        <Grid gap={8}>
          <Text size='small' color='gray'>
            {currentSection.count} total
          </Text>
          <Title size='medium'>{currentSection.title}</Title>
          <Text color='gray'>{currentSection.description}</Text>
        </Grid>
        <div>
          <Button href={currentSection.href}>{currentSection.ctaLabel}</Button>
        </div>
      </Grid>
    </Card>
  );
}

export default async function CompetitionsOverviewPage({
  searchParams,
}: CompetitionsOverviewPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const params = await searchParams;
  const section = parseSection(extractSingleValue(params?.section));
  const [typesResponse, competitionsResponse, seasonsResponse, editionsResponse] =
    await Promise.all([
      getAdminCompetitionTypes({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
      getAdminCompetitions({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
      getAdminSeasons({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
      getAdminCompetitionEditions({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
    ]);

  return (
    <Grid gap={24}>
      <SectionHeader
        navigation={[{ label: SECTIONS.COMPETITIONS }]}
        icon='trophy'
      >
        <ButtonGroup gap={4}>
          <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_TYPE}>
            Create competition type
          </Button>
          <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION}>
            Create competition
          </Button>
          <Button icon='plus' href={NAVIGATION.CREATE_A_SEASON}>
            Create season
          </Button>
          <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_EDITION}>
            Create edition
          </Button>
        </ButtonGroup>
      </SectionHeader>
      <Main>
        <Grid className='c-aside-grid' gap={16}>
          <EntitySidebarNavigation
            activeItem={section}
            items={[
              {
                id: 'overview',
                label: 'Overview',
                href: buildCompetitionsHref('overview'),
              },
              {
                id: 'types',
                label: 'Competition Types',
                href: buildCompetitionsHref('types'),
              },
              {
                id: 'competitions',
                label: 'Competitions',
                href: buildCompetitionsHref('competitions'),
              },
              {
                id: 'seasons',
                label: 'Seasons',
                href: buildCompetitionsHref('seasons'),
              },
              {
                id: 'editions',
                label: 'Competition Editions',
                href: buildCompetitionsHref('editions'),
              },
            ]}
          />
          {renderSectionContent(section, {
            types: typesResponse.metadata.totalItems,
            competitions: competitionsResponse.metadata.totalItems,
            seasons: seasonsResponse.metadata.totalItems,
            editions: editionsResponse.metadata.totalItems,
          })}
        </Grid>
      </Main>
    </Grid>
  );
}
