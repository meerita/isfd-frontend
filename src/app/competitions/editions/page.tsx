/** @format */

import Link from 'next/link';

import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAdminCompetitionEditions } from '@/_actions/competitionEdition/getAdminCompetitionEditions';
import { getAllCompetitionPyramids } from '@/_actions/competitionStructure/getAllCompetitionPyramids';
import { getAllCompetitionTiers } from '@/_actions/competitionStructure/getAllCompetitionTiers';
import Card from '@/_components/Card';
import Icon from '@/_components/Icon';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import { getCompetitionEditionStatusLabel } from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { getDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
  CompetitionEditionVisibilityFilter,
} from '@/_types/competitionEdition';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  parseUuid,
  PLACEHOLDER,
} from '../_components/utils';
import CompetitionEditionFilters from './_components/CompetitionEditionFilters';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionEditionSort = 'updated_at_desc';
const SORT_OPTIONS = new Set<CompetitionEditionSort>([
  'created_at_asc',
  'created_at_desc',
  'updated_at_asc',
  'updated_at_desc',
  'name_asc',
  'name_desc',
  'sort_order_asc',
  'sort_order_desc',
  'year_asc',
  'year_desc',
  'started_on_asc',
  'started_on_desc',
]);
const STATUS_OPTIONS = new Set<CompetitionEditionStatusFilter>([
  'all',
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'ARCHIVED',
  'HIDDEN',
]);
const VISIBILITY_OPTIONS = new Set<CompetitionEditionVisibilityFilter>([
  'all',
  'public',
  'private',
]);

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  visibility?: string | string[];
  competition_id?: string | string[];
  competition_pyramid_id?: string | string[];
  primary_competition_tier_id?: string | string[];
  year?: string | string[];
  q?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionEditionSort,
  status?: CompetitionEditionStatusFilter,
  visibility?: CompetitionEditionVisibilityFilter,
  competitionId?: string,
  competitionPyramidId?: string,
  primaryCompetitionTierId?: string,
  year?: number,
  q?: string,
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);

  if (status) params.set('status', status);
  if (visibility) params.set('visibility', visibility);
  if (competitionId) params.set('competition_id', competitionId);
  if (competitionPyramidId) {
    params.set('competition_pyramid_id', competitionPyramidId);
  }
  if (primaryCompetitionTierId) {
    params.set('primary_competition_tier_id', primaryCompetitionTierId);
  }
  if (typeof year === 'number') params.set('year', String(year));
  if (q) params.set('q', q);

  return `${NAVIGATION.COMPETITION_EDITIONS}?${params.toString()}`;
}

function formatPaginationLabel(
  template: string,
  currentPage: number,
  totalPages: number,
): string {
  return template
    .replace('{current}', String(currentPage))
    .replace('{total}', String(totalPages));
}

export default async function CompetitionEditionsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const locale = await resolveRequestLocale();
  const dictionary = getDictionary(locale);
  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const rawSort = parseString(params?.sort);
  const sort =
    rawSort && SORT_OPTIONS.has(rawSort as CompetitionEditionSort)
      ? (rawSort as CompetitionEditionSort)
      : DEFAULT_SORT;
  const rawStatus = parseString(params?.status);
  const status =
    rawStatus && STATUS_OPTIONS.has(rawStatus as CompetitionEditionStatusFilter)
      ? (rawStatus as CompetitionEditionStatusFilter)
      : undefined;
  const rawVisibility = parseString(params?.visibility);
  const visibility =
    rawVisibility &&
    VISIBILITY_OPTIONS.has(rawVisibility as CompetitionEditionVisibilityFilter)
      ? (rawVisibility as CompetitionEditionVisibilityFilter)
      : undefined;
  const competitionId = parseUuid(params?.competition_id);
  const competitionPyramidId = parseUuid(params?.competition_pyramid_id);
  const primaryCompetitionTierId = parseUuid(params?.primary_competition_tier_id);
  const rawYear = parseString(params?.year);
  const year =
    rawYear && Number.isFinite(Number(rawYear)) ? Number(rawYear) : undefined;
  const q = parseString(params?.q);

  const [response, competitions, competitionPyramids, competitionTiers] =
    await Promise.all([
      getAdminCompetitionEditions({
        page,
        pageSize,
        sort,
        status,
        visibility,
        competitionId,
        competitionPyramidId,
        primaryCompetitionTierId,
        year,
        q,
      }),
      getAllCompetitions(),
      getAllCompetitionPyramids(),
      getAllCompetitionTiers(),
    ]);

  const competitionLabels = new Map(competitions.map(item => [item.id, item.name]));
  const competitionPyramidLabels = new Map(
    competitionPyramids.map(item => [item.id, item.name]),
  );
  const competitionTierLabels = new Map(
    competitionTiers.map(item => [item.id, item.name]),
  );

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.competitions.editions.title} icon='docs'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_EDITION}>
          {dictionary.competitions.editions.createAction}
        </Button>
      </SectionHeader>

      <Card>
        <CompetitionEditionFilters
          pageSize={pageSize}
          sort={sort}
          status={status}
          visibility={visibility}
          competitionId={competitionId}
          competitionPyramidId={competitionPyramidId}
          primaryCompetitionTierId={primaryCompetitionTierId}
          year={year}
          q={q}
          competitions={competitions.map(item => ({ id: item.id, name: item.name }))}
          competitionPyramids={competitionPyramids.map(item => ({
            id: item.id,
            name: item.name,
          }))}
          competitionTiers={competitionTiers.map(item => ({
            id: item.id,
            name: item.name,
          }))}
        />

        {response.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>{dictionary.competitions.editions.loadErrorTitle}</Text>
              <Text size='small' color='gray'>
                {resolveCompetitionAdminErrorMessage(response.error)}
              </Text>
            </Grid>
          </Main>
        ) : (
          <>
            <Main>
              <Table>
                <Thead>
                  <Row>
                    <Cell header>{dictionary.competitions.editions.headers.name}</Cell>
                    <Cell header className='padding-left--16'>Competition</Cell>
                    <Cell header className='padding-left--16'>Competition pyramid</Cell>
                    <Cell header className='padding-left--16'>Primary tier</Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.editions.headers.status}
                    </Cell>
                    <Cell header align='center'>Visibility</Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.editions.headers.year}
                    </Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.editions.headers.updated}
                    </Cell>
                  </Row>
                </Thead>
                <Tbody>
                  {response.data.length === 0 ? (
                    <Row>
                      <Cell>{dictionary.competitions.editions.emptyState}</Cell>
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
                    response.data.map(item => (
                      <Row
                        key={item.id}
                        href={NAVIGATION.COMPETITION_EDITION_BY_ID(item.id)}
                      >
                        <Cell>{item.name}</Cell>
                        <Cell className='padding-left--16'>
                          {competitionLabels.get(item.competitionId) ??
                            item.competitionName ??
                            item.competitionId}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.competitionPyramidId
                            ? competitionPyramidLabels.get(item.competitionPyramidId) ??
                              item.competitionPyramidId
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.primaryCompetitionTierId
                            ? competitionTierLabels.get(item.primaryCompetitionTierId) ??
                              item.primaryCompetitionTierId
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getCompetitionEditionStatusLabel(item.editorialStatus, locale)}
                        </Cell>
                        <Cell align='center'>
                          {item.isPublic ? 'Public' : 'Private'}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {item.year ?? PLACEHOLDER}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {formatDateOnly(item.updatedAt)}
                        </Cell>
                      </Row>
                    ))
                  )}
                </Tbody>
              </Table>
            </Main>

            <Grid justifyItems='center' className='margin-block--16'>
              <Grid gap={16} display='flex' alignItems='center'>
                {response.metadata.hasPreviousPage ? (
                  <Link
                    href={buildHref(
                      response.metadata.page - 1,
                      pageSize,
                      sort,
                      status,
                      visibility,
                      competitionId,
                      competitionPyramidId,
                      primaryCompetitionTierId,
                      year,
                      q,
                    )}
                    aria-label={dictionary.common.previous}
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  {formatPaginationLabel(
                    dictionary.competitions.editions.paginationLabel,
                    response.metadata.page,
                    Math.max(1, response.metadata.totalPages),
                  )}
                </Text>
                {response.metadata.hasNextPage ? (
                  <Link
                    href={buildHref(
                      response.metadata.page + 1,
                      pageSize,
                      sort,
                      status,
                      visibility,
                      competitionId,
                      competitionPyramidId,
                      primaryCompetitionTierId,
                      year,
                      q,
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
      </Card>
    </Grid>
  );
}
