/** @format */

import Link from 'next/link';

import { getAdminCompetitionTiers } from '@/_actions/competitionStructure/getAdminCompetitionTiers';
import { getAllCompetitionPyramids } from '@/_actions/competitionStructure/getAllCompetitionPyramids';
import { getAllCompetitionTiers } from '@/_actions/competitionStructure/getAllCompetitionTiers';
import Card from '@/_components/Card';
import Dot from '@/_components/Dot';
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
import {
  getCompetitionScopeKindLabel,
  getParticipantScopeLabel,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { getDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
} from '@/_types/competitionStructure';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  parseUuid,
  PLACEHOLDER,
} from '../../_components/utils';
import CompetitionTierFilters from './_components/CompetitionTierFilters';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionStructureSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  competition_pyramid_id?: string | string[];
  parent_tier_id?: string | string[];
  participant_scope?: string | string[];
  scope_kind?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionStructureSort,
  status?: CompetitionStructureStatusFilter,
  competitionPyramidId?: string,
  parentTierId?: string,
  participantScope?: string,
  scopeKind?: string,
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);

  if (status) {
    params.set('status', status);
  }

  if (competitionPyramidId) {
    params.set('competition_pyramid_id', competitionPyramidId);
  }

  if (parentTierId) {
    params.set('parent_tier_id', parentTierId);
  }

  if (participantScope) {
    params.set('participant_scope', participantScope);
  }

  if (scopeKind) {
    params.set('scope_kind', scopeKind);
  }

  return `${NAVIGATION.COMPETITION_TIERS}?${params.toString()}`;
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

export default async function CompetitionTiersPage({
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
  const sort =
    (parseString(params?.sort) as CompetitionStructureSort | undefined) ??
    DEFAULT_SORT;
  const status = parseString(params?.status) as
    | CompetitionStructureStatusFilter
    | undefined;
  const competitionPyramidId = parseUuid(params?.competition_pyramid_id);
  const parentTierId = parseUuid(params?.parent_tier_id);
  const participantScope = parseString(params?.participant_scope);
  const scopeKind = parseString(params?.scope_kind);

  const [response, competitionPyramids, competitionTiers] = await Promise.all([
    getAdminCompetitionTiers({
      page,
      pageSize,
      sort,
      status,
      competitionPyramidId,
      parentTierId,
      participantScope,
      scopeKind,
    }),
    getAllCompetitionPyramids(),
    getAllCompetitionTiers(),
  ]);

  const pyramidLabels = new Map(
    competitionPyramids.map(item => [item.id, item.name]),
  );
  const tierLabels = new Map(competitionTiers.map(item => [item.id, item.name]));
  const parentTierOptions = competitionPyramidId
    ? competitionTiers
        .filter(item => item.competitionPyramidId === competitionPyramidId)
        .map(item => ({ id: item.id, name: item.name }))
    : competitionTiers.map(item => ({ id: item.id, name: item.name }));

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.competitions.tiers.title} icon='analytics'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_TIER}>
          {dictionary.competitions.tiers.createAction}
        </Button>
      </SectionHeader>

      <Card>
        <CompetitionTierFilters
          pageSize={pageSize}
          sort={sort}
          status={status}
          competitionPyramidId={competitionPyramidId}
          parentTierId={parentTierId}
          participantScope={participantScope}
          scopeKind={scopeKind}
          competitionPyramids={competitionPyramids.map(item => ({
            id: item.id,
            name: item.name,
          }))}
          parentTierOptions={parentTierOptions}
        />

        {response.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>{dictionary.competitions.tiers.loadErrorTitle}</Text>
              <Text size='small' color='gray'>
                {resolveCompetitionAdminErrorMessage(
                  response.error,
                  dictionary.common.unexpectedError,
                )}
              </Text>
            </Grid>
          </Main>
        ) : (
          <>
            <Main>
              <Table>
                <Thead>
                  <Row>
                    <Cell header>{dictionary.competitions.tiers.headers.name}</Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.pyramid}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.parentTier}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.scope}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.participantScope}
                    </Cell>
                    <Cell header align='center' className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.level}
                    </Cell>
                    <Cell header align='center'>
                      {dictionary.competitions.tiers.headers.active}
                    </Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.tiers.headers.updated}
                    </Cell>
                  </Row>
                </Thead>
                <Tbody>
                  {response.data.length === 0 ? (
                    <Row>
                      <Cell>{dictionary.competitions.tiers.emptyState}</Cell>
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
                        href={NAVIGATION.COMPETITION_TIER_BY_ID(item.id)}
                      >
                        <Cell>{item.name}</Cell>
                        <Cell className='padding-left--16'>
                          {pyramidLabels.get(item.competitionPyramidId) ??
                            item.competitionPyramidId}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.parentTierId
                            ? (tierLabels.get(item.parentTierId) ?? item.parentTierId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getCompetitionScopeKindLabel(item.scopeKind, locale)}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getParticipantScopeLabel(item.participantScope, locale)}
                        </Cell>
                        <Cell align='center' className='padding-left--16'>
                          {item.levelOrder ?? PLACEHOLDER}
                        </Cell>
                        <Cell align='center'>
                          <Dot inline active={item.isActive} />
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
                      competitionPyramidId,
                      parentTierId,
                      participantScope,
                      scopeKind,
                    )}
                    aria-label={dictionary.common.previous}
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  {formatPaginationLabel(
                    dictionary.competitions.tiers.paginationLabel,
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
                      competitionPyramidId,
                      parentTierId,
                      participantScope,
                      scopeKind,
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
