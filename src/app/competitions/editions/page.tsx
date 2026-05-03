/** @format */

import Link from 'next/link';

import { getAdminCompetitionEditions } from '@/_actions/competitionEdition/getAdminCompetitionEditions';
import { getAllCompetitions } from '@/_actions/competition/getAllCompetitions';
import { getAllSeasons } from '@/_actions/season/getAllSeasons';
import Dot from '@/_components/Dot';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Icon from '@/_components/Icon';
import Text from '@/_components/typography/Text';
import { getCompetitionEditionStatusLabel } from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionEditionActiveStatusFilter,
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
} from '@/_types/competitionEdition';
import CompetitionEditionFilters from './_components/CompetitionEditionFilters';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  parseUuid,
  PLACEHOLDER,
} from '../_components/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionEditionSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  active_status?: string | string[];
  competition_id?: string | string[];
  year?: string | string[];
  q?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionEditionSort,
  status?: CompetitionEditionStatusFilter,
  activeStatus?: CompetitionEditionActiveStatusFilter,
  competitionId?: string,
  year?: number,
  q?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (activeStatus) params.set('active_status', activeStatus);
  if (competitionId) params.set('competition_id', competitionId);
  if (typeof year === 'number') params.set('year', String(year));
  if (q) params.set('q', q);

  return `${NAVIGATION.COMPETITION_EDITIONS}?${params.toString()}`;
}

export default async function CompetitionEditionsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as CompetitionEditionSort | undefined) ??
    DEFAULT_SORT;
  const status = parseString(params?.status) as
    | CompetitionEditionStatusFilter
    | undefined;
  const activeStatus = parseString(params?.active_status) as
    | CompetitionEditionActiveStatusFilter
    | undefined;
  const competitionId = parseUuid(params?.competition_id);
  const rawYear = parseString(params?.year);
  const year = rawYear && Number.isFinite(Number(rawYear)) ? Number(rawYear) : undefined;
  const q = parseString(params?.q);

  const [response, competitions, seasons] = await Promise.all([
    getAdminCompetitionEditions({
      page,
      pageSize,
      sort,
      status,
      activeStatus,
      competitionId,
      year,
      q,
    }),
    getAllCompetitions(),
    getAllSeasons(),
  ]);

  const competitionLabels = new Map(competitions.map(item => [item.id, item.name]));
  const seasonLabels = new Map(seasons.map(item => [item.id, item.name]));

  return (
    <Grid gap={16}>
      <SectionHeader title='Competition editions' icon='docs'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_EDITION}>
          Create edition
        </Button>
      </SectionHeader>

      <CompetitionEditionFilters
        pageSize={pageSize}
        sort={sort}
        status={status}
        activeStatus={activeStatus}
        competitionId={competitionId}
        year={year}
        q={q}
        competitions={competitions.map(item => ({ id: item.id, name: item.name }))}
      />

      {response.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load competition editions.</Text>
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
                  <Cell header className='padding-left--16'>
                    Name
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Slug
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Code
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Competition
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Season
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Status
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Year
                  </Cell>
                  <Cell header align='center'>
                    Active
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Updated
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {response.data.length === 0 ? (
                  <Row>
                    <Cell>No competition editions found for the current filters.</Cell>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Cell key={`empty-${index}`} className='padding-left--16'>
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
                      <Cell className='padding-left--16'>{item.name}</Cell>
                      <Cell className='padding-left--16'>{item.slug}</Cell>
                      <Cell className='padding-left--16'>
                        {item.code ?? PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {item.competitionId
                          ? competitionLabels.get(item.competitionId) ?? item.competitionId
                          : PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {item.seasonId
                          ? seasonLabels.get(item.seasonId) ?? item.seasonId
                          : PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {getCompetitionEditionStatusLabel(item.status)}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {item.year ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {item.isActive ? <Dot inline active /> : <Dot inline />}
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
                    activeStatus,
                    competitionId,
                    year,
                    q,
                  )}
                  aria-label='Previous'
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                Page {response.metadata.page} of{' '}
                {Math.max(1, response.metadata.totalPages)}
              </Text>
              {response.metadata.hasNextPage ? (
                <Link
                  href={buildHref(
                    response.metadata.page + 1,
                    pageSize,
                    sort,
                    status,
                    activeStatus,
                    competitionId,
                    year,
                    q,
                  )}
                  aria-label='Next'
                >
                  <Icon name='arrowRight' size={24} fill='gray' />
                </Link>
              ) : null}
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
}
