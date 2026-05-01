/** @format */

import Link from 'next/link';

import { getAdminSeasons } from '@/_actions/season/getAdminSeasons';
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
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { SeasonSort, SeasonStatusFilter } from '@/_types/season';
import SeasonFilters from './_components/SeasonFilters';
import { formatDateOnly, parsePositiveInt, parseString, PLACEHOLDER } from '../_components/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: SeasonSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  year?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: SeasonSort,
  status?: SeasonStatusFilter,
  year?: number,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (typeof year === 'number') params.set('year', String(year));

  return `${NAVIGATION.COMPETITION_SEASONS}?${params.toString()}`;
}

export default async function SeasonsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort = (parseString(params?.sort) as SeasonSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as SeasonStatusFilter | undefined;
  const parsedYear = parseString(params?.year);
  const year =
    parsedYear && Number.isFinite(Number(parsedYear)) ? Number(parsedYear) : undefined;

  const response = await getAdminSeasons({ page, pageSize, sort, status, year });

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Seasons' },
        ]}
        icon='trophy'
      >
        <Button icon='plus' href={NAVIGATION.CREATE_A_SEASON}>
          Create season
        </Button>
      </SectionHeader>

      <SeasonFilters pageSize={pageSize} sort={sort} status={status} year={year} />

      {response.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load seasons.</Text>
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
                  <Cell header align='right' className='padding-left--16'>
                    Start year
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    End year
                  </Cell>
                  <Cell header align='center'>
                    Active
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Created
                  </Cell>
                  <Cell header align='right' className='padding-left--16'>
                    Updated
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {response.data.length === 0 ? (
                  <Row>
                    <Cell>No seasons found for the current filters.</Cell>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Cell key={`empty-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  response.data.map(item => (
                    <Row key={item.id} href={NAVIGATION.SEASON_BY_ID(item.id)}>
                      <Cell className='padding-left--16'>{item.name}</Cell>
                      <Cell className='padding-left--16'>{item.slug}</Cell>
                      <Cell className='padding-left--16'>{item.code}</Cell>
                      <Cell align='right' className='padding-left--16'>
                        {item.startYear}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {item.endYear ?? PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {item.isActive ? <Dot inline active /> : <Dot inline />}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatDateOnly(item.createdAt)}
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
                    year,
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
                    year,
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
