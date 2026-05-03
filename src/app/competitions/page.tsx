/** @format */

import Link from 'next/link';

import { getAdminCompetitionTypes } from '@/_actions/competitionType/getAdminCompetitionTypes';
import { getAdminCompetitionPyramids } from '@/_actions/competitionStructure/getAdminCompetitionPyramids';
import { getAdminCompetitionTiers } from '@/_actions/competitionStructure/getAdminCompetitionTiers';
import { getAdminCompetitions } from '@/_actions/competition/getAdminCompetitions';
import { getAdminCompetitionEditions } from '@/_actions/competitionEdition/getAdminCompetitionEditions';
import { getAdminSeasons } from '@/_actions/season/getAdminSeasons';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import SectionHeader from '@/_components/layout/SectionHeader';
import Card from '@/_components/Card';
import Icon from '@/_components/Icon';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import {
  getCompetitionTypeCategoryLabel,
  getParticipantScopeLabel,
  parseCompetitionTypeCategory,
  parseParticipantScope,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import type { AppLocale } from '@/_i18n/config';
import { getDictionary, type AppDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionTypeListResponse,
  CompetitionTypeSort,
  CompetitionTypeStatusFilter,
} from '@/_types/competitionType';
import CompetitionOverviewCard from './_components/CompetitionOverviewCard';
import CompetitionTypeFilters from './types/_components/CompetitionTypeFilters';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  PLACEHOLDER,
} from './_components/utils';
import Dot from '@/_components/Dot';

type CompetitionsOverviewSection =
  | 'overview'
  | 'types'
  | 'competitions'
  | 'pyramids'
  | 'tiers'
  | 'seasons'
  | 'editions';

type CompetitionsOverviewPageProps = Readonly<{
  searchParams?:
    | Promise<{
        section?: string | string[];
        page?: string | string[];
        page_size?: string | string[];
        sort?: string | string[];
        status?: string | string[];
        competition_type_category?: string | string[];
        participant_scope?: string | string[];
      }>
    | {
        section?: string | string[];
        page?: string | string[];
        page_size?: string | string[];
        sort?: string | string[];
        status?: string | string[];
        competition_type_category?: string | string[];
        participant_scope?: string | string[];
      };
}>;

const DEFAULT_COMPETITION_TYPE_PAGE = 1;
const DEFAULT_COMPETITION_TYPE_PAGE_SIZE = 20;
const DEFAULT_COMPETITION_TYPE_SORT: CompetitionTypeSort = 'updated_at_desc';

function extractSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSection(value: string | undefined): CompetitionsOverviewSection {
  switch (value) {
    case 'types':
    case 'competitions':
    case 'pyramids':
    case 'tiers':
    case 'seasons':
    case 'editions':
      return value;
    case 'overview':
    default:
      return 'overview';
  }
}

function buildCompetitionTypesHref(
  page: number,
  pageSize: number,
  sort: CompetitionTypeSort,
  status?: CompetitionTypeStatusFilter,
  competitionTypeCategory?: string,
  participantScope?: string,
): string {
  const params = new URLSearchParams();
  params.set('section', 'types');
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (competitionTypeCategory) {
    params.set('competition_type_category', competitionTypeCategory);
  }
  if (participantScope) params.set('participant_scope', participantScope);

  return `${NAVIGATION.COMPETITIONS}?${params.toString()}`;
}

function renderSectionContent(
  section: CompetitionsOverviewSection,
  counts: {
    types: number;
    competitions: number;
    pyramids: number;
    tiers: number;
    seasons: number;
    editions: number;
  },
  competitionTypesState: Readonly<{
    pageSize: number;
    sort: CompetitionTypeSort;
    status?: CompetitionTypeStatusFilter;
    competitionTypeCategory?: string;
    participantScope?: string;
    response: CompetitionTypeListResponse;
  }>,
  dictionary: AppDictionary,
  locale: AppLocale,
): React.JSX.Element {
  if (section === 'overview') {
    return (
      <Grid gap={16}>
        <SectionHeader
          title={dictionary.competitions.sidebar.overview}
          icon='overview'
        />
        <Card>
          <Grid gap={24}>
            <Text color='gray'>{dictionary.competitions.overviewIntro}</Text>
          </Grid>

          <Grid columns={3} gap={16}>
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITION_TYPES}
              title={dictionary.competitions.cards.typesTitle}
              description={dictionary.competitions.cards.typesDescription}
              count={`${counts.types} ${dictionary.competitions.totalSuffix}`}
            />
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITIONS_LIST}
              title={dictionary.competitions.cards.competitionsTitle}
              description={
                dictionary.competitions.cards.competitionsDescription
              }
              count={`${counts.competitions} ${dictionary.competitions.totalSuffix}`}
            />
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITION_PYRAMIDS}
              title={dictionary.competitions.cards.pyramidsTitle}
              description={dictionary.competitions.cards.pyramidsDescription}
              count={`${counts.pyramids} ${dictionary.competitions.totalSuffix}`}
            />
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITION_TIERS}
              title={dictionary.competitions.cards.tiersTitle}
              description={dictionary.competitions.cards.tiersDescription}
              count={`${counts.tiers} ${dictionary.competitions.totalSuffix}`}
            />
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITION_SEASONS}
              title={dictionary.competitions.cards.seasonsTitle}
              description={dictionary.competitions.cards.seasonsDescription}
              count={`${counts.seasons} ${dictionary.competitions.totalSuffix}`}
            />
            <CompetitionOverviewCard
              href={NAVIGATION.COMPETITION_EDITIONS}
              title={dictionary.competitions.cards.editionsTitle}
              description={dictionary.competitions.cards.editionsDescription}
              count={`${counts.editions} ${dictionary.competitions.totalSuffix}`}
            />
          </Grid>
        </Card>
      </Grid>
    );
  }

  if (section === 'types') {
    return (
      <Grid gap={16}>
        <SectionHeader
          title={dictionary.competitions.types.title}
          icon='library'
        >
          <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_TYPE}>
            {dictionary.competitions.types.createAction}
          </Button>
        </SectionHeader>
        <Card>
          <Grid gap={24}>
            <CompetitionTypeFilters
              pageSize={competitionTypesState.pageSize}
              sort={competitionTypesState.sort}
              status={competitionTypesState.status}
              competitionTypeCategory={
                competitionTypesState.competitionTypeCategory
              }
              participantScope={competitionTypesState.participantScope}
            />

            {competitionTypesState.response.error ? (
              <Grid gap={8}>
                <Text weight='bold'>
                  {dictionary.competitions.types.loadErrorTitle}
                </Text>
                <Text size='small' color='gray'>
                  {resolveCompetitionAdminErrorMessage(
                    competitionTypesState.response.error,
                  )}
                </Text>
              </Grid>
            ) : (
              <>
                <Table>
                  <Thead>
                    <Row>
                      <Cell header>
                        {dictionary.competitions.types.headers.name}
                      </Cell>
                      <Cell header>
                        {dictionary.competitions.types.headers.category}
                      </Cell>
                      <Cell header>
                        {dictionary.competitions.types.headers.participantScope}
                      </Cell>
                      <Cell header align='center'>
                        {dictionary.competitions.types.headers.active}
                      </Cell>
                      <Cell header align='right' className='padding-right--16'>
                        {dictionary.competitions.types.headers.created}
                      </Cell>
                      <Cell header align='right' className='padding-right--16'>
                        {dictionary.competitions.types.headers.updated}
                      </Cell>
                    </Row>
                  </Thead>
                  <Tbody>
                    {competitionTypesState.response.data.length === 0 ? (
                      <Row>
                        <Cell>{dictionary.competitions.types.emptyState}</Cell>
                        {Array.from({ length: 7 }).map((_, index) => (
                          <Cell
                            key={`empty-${index}`}
                            className='padding-left--16'
                          >
                            {PLACEHOLDER}
                          </Cell>
                        ))}
                      </Row>
                    ) : (
                      competitionTypesState.response.data.map(item => (
                        <Row
                          key={item.id}
                          href={NAVIGATION.COMPETITION_TYPE_BY_ID(item.id)}
                        >
                          <Cell>{item.name}</Cell>
                          <Cell>
                            {getCompetitionTypeCategoryLabel(
                              item.competitionTypeCategory,
                              locale,
                            )}
                          </Cell>
                          <Cell>
                            {getParticipantScopeLabel(
                              item.participantScope,
                              locale,
                            )}
                          </Cell>
                          <Cell align='center'>
                            <Dot inline active={item.isActive} />
                          </Cell>
                          <Cell align='right' className='padding-right--16'>
                            {formatDateOnly(item.createdAt)}
                          </Cell>
                          <Cell align='right' className='padding-right--16'>
                            {formatDateOnly(item.updatedAt)}
                          </Cell>
                        </Row>
                      ))
                    )}
                  </Tbody>
                </Table>

                <Grid justifyItems='center' className='margin-block--16'>
                  <Grid gap={16} display='flex' alignItems='center'>
                    {competitionTypesState.response.metadata.hasPreviousPage ? (
                      <Link
                        href={buildCompetitionTypesHref(
                          competitionTypesState.response.metadata.page - 1,
                          competitionTypesState.pageSize,
                          competitionTypesState.sort,
                          competitionTypesState.status,
                          competitionTypesState.competitionTypeCategory,
                          competitionTypesState.participantScope,
                        )}
                        aria-label={dictionary.common.previous}
                      >
                        <Icon name='arrowLeft' size={24} fill='gray' />
                      </Link>
                    ) : null}
                    <Text color='gray' size='small' weight='semibold'>
                      {dictionary.competitions.types.paginationLabel
                        .replace(
                          '{current}',
                          String(competitionTypesState.response.metadata.page),
                        )
                        .replace(
                          '{total}',
                          String(
                            Math.max(
                              1,
                              competitionTypesState.response.metadata
                                .totalPages,
                            ),
                          ),
                        )}
                    </Text>
                    {competitionTypesState.response.metadata.hasNextPage ? (
                      <Link
                        href={buildCompetitionTypesHref(
                          competitionTypesState.response.metadata.page + 1,
                          competitionTypesState.pageSize,
                          competitionTypesState.sort,
                          competitionTypesState.status,
                          competitionTypesState.competitionTypeCategory,
                          competitionTypesState.participantScope,
                        )}
                        aria-label={dictionary.common.next}
                      >
                        <Icon name='arrowRight' size={24} fill='gray' />
                      </Link>
                    ) : null}
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Card>
      </Grid>
    );
  }

  const sectionConfig: Readonly<
    Record<
      Exclude<CompetitionsOverviewSection, 'overview' | 'types'>,
      {
        title: string;
        description: string;
        href: string;
        count: number;
        ctaLabel: string;
        icon: 'trophy' | 'group' | 'analytics' | 'eventUpcoming' | 'docs';
      }
    >
  > = {
    competitions: {
      title: dictionary.competitions.sections.competitionsTitle,
      description: dictionary.competitions.sections.competitionsDescription,
      href: NAVIGATION.COMPETITIONS_LIST,
      count: counts.competitions,
      ctaLabel: dictionary.competitions.sections.competitionsCta,
      icon: 'trophy',
    },
    pyramids: {
      title: dictionary.competitions.sections.pyramidsTitle,
      description: dictionary.competitions.sections.pyramidsDescription,
      href: NAVIGATION.COMPETITION_PYRAMIDS,
      count: counts.pyramids,
      ctaLabel: dictionary.competitions.sections.pyramidsCta,
      icon: 'group',
    },
    tiers: {
      title: dictionary.competitions.sections.tiersTitle,
      description: dictionary.competitions.sections.tiersDescription,
      href: NAVIGATION.COMPETITION_TIERS,
      count: counts.tiers,
      ctaLabel: dictionary.competitions.sections.tiersCta,
      icon: 'analytics',
    },
    seasons: {
      title: dictionary.competitions.sections.seasonsTitle,
      description: dictionary.competitions.sections.seasonsDescription,
      href: NAVIGATION.COMPETITION_SEASONS,
      count: counts.seasons,
      ctaLabel: dictionary.competitions.sections.seasonsCta,
      icon: 'eventUpcoming',
    },
    editions: {
      title: dictionary.competitions.sections.editionsTitle,
      description: dictionary.competitions.sections.editionsDescription,
      href: NAVIGATION.COMPETITION_EDITIONS,
      count: counts.editions,
      ctaLabel: dictionary.competitions.sections.editionsCta,
      icon: 'docs',
    },
  };

  const currentSection = sectionConfig[section];

  return (
    <Grid gap={16}>
      <SectionHeader title={currentSection.title} icon={currentSection.icon}>
        <Button href={currentSection.href}>{currentSection.ctaLabel}</Button>
      </SectionHeader>
      <Card>
        <Grid gap={24}>
          <Grid gap={8}>
            <Text size='small' color='gray'>
              {currentSection.count} {dictionary.competitions.totalSuffix}
            </Text>
            <Title size='medium'>{currentSection.title}</Title>
            <Text color='gray'>{currentSection.description}</Text>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}

export default async function CompetitionsOverviewPage({
  searchParams,
}: CompetitionsOverviewPageProps): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);
  const params = await searchParams;
  const section = parseSection(extractSingleValue(params?.section));
  const competitionTypesPage = parsePositiveInt(
    params?.page,
    DEFAULT_COMPETITION_TYPE_PAGE,
  );
  const competitionTypesPageSize = parsePositiveInt(
    params?.page_size,
    DEFAULT_COMPETITION_TYPE_PAGE_SIZE,
    100,
  );
  const competitionTypesSort =
    (parseString(params?.sort) as CompetitionTypeSort | undefined) ??
    DEFAULT_COMPETITION_TYPE_SORT;
  const competitionTypesStatus = parseString(params?.status) as
    | CompetitionTypeStatusFilter
    | undefined;
  const competitionTypeCategory =
    parseCompetitionTypeCategory(
      parseString(params?.competition_type_category),
    ) ?? undefined;
  const participantScope =
    parseParticipantScope(parseString(params?.participant_scope)) ?? undefined;
  const [
    typesResponse,
    competitionsResponse,
    pyramidsResponse,
    tiersResponse,
    seasonsResponse,
    editionsResponse,
  ] = await Promise.all([
    getAdminCompetitionTypes({
      page: competitionTypesPage,
      pageSize: competitionTypesPageSize,
      sort: competitionTypesSort,
      status: competitionTypesStatus,
      competitionTypeCategory,
      participantScope,
    }),
    getAdminCompetitions({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
    getAdminCompetitionPyramids({
      page: 1,
      pageSize: 1,
      sort: 'updated_at_desc',
    }),
    getAdminCompetitionTiers({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
    getAdminSeasons({ page: 1, pageSize: 1, sort: 'updated_at_desc' }),
    getAdminCompetitionEditions({
      page: 1,
      pageSize: 1,
      sort: 'updated_at_desc',
    }),
  ]);

  return (
    <Grid gap={16}>
      {renderSectionContent(
        section,
        {
          types: typesResponse.metadata.totalItems,
          competitions: competitionsResponse.metadata.totalItems,
          pyramids: pyramidsResponse.metadata.totalItems,
          tiers: tiersResponse.metadata.totalItems,
          seasons: seasonsResponse.metadata.totalItems,
          editions: editionsResponse.metadata.totalItems,
        },
        {
          pageSize: competitionTypesPageSize,
          sort: competitionTypesSort,
          status: competitionTypesStatus,
          competitionTypeCategory,
          participantScope,
          response: typesResponse,
        },
        dictionary,
        locale,
      )}
    </Grid>
  );
}
