/** @format */

import Link from 'next/link';

import { getAdminCompetitions } from '@/_actions/competition/getAdminCompetitions';
import { getAllCompetitionTypes } from '@/_actions/competitionType/getAllCompetitionTypes';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
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
import type { CompetitionSort, CompetitionStatusFilter } from '@/_types/competition';
import CompetitionFilters from './_components/CompetitionFilters';
import {
  formatDateOnly,
  parsePositiveInt,
  parseUuid,
  parseString,
  PLACEHOLDER,
} from '../_components/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  competition_type_id?: string | string[];
  federation_id?: string | string[];
  country_id?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionSort,
  status?: CompetitionStatusFilter,
  competitionTypeId?: string,
  federationId?: string,
  countryId?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (competitionTypeId) params.set('competition_type_id', competitionTypeId);
  if (federationId) params.set('federation_id', federationId);
  if (countryId) params.set('country_id', countryId);

  return `${NAVIGATION.COMPETITIONS_LIST}?${params.toString()}`;
}

export default async function CompetitionsListPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as CompetitionSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as CompetitionStatusFilter | undefined;
  const competitionTypeId = parseUuid(params?.competition_type_id);
  const federationId = parseUuid(params?.federation_id);
  const countryId = parseUuid(params?.country_id);

  const [response, competitionTypes, federations, countries] = await Promise.all([
    getAdminCompetitions({
      page,
      pageSize,
      sort,
      status,
      competitionTypeId,
      federationId,
      countryId,
    }),
    getAllCompetitionTypes(),
    getAllFederations(),
    getAllCountries(),
  ]);

  const competitionTypeLabels = new Map(
    competitionTypes.map(item => [item.id, item.name]),
  );
  const federationLabels = new Map(federations.map(item => [item.id, item.name]));
  const countryLabels = new Map(countries.map(item => [item.id, item.name]));

  return (
    <Grid gap={16}>
      <SectionHeader
        navigation={[
          { label: 'Competitions', href: NAVIGATION.COMPETITIONS },
          { label: 'Competitions' },
        ]}
        icon='trophy'
      >
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION}>
          Create competition
        </Button>
      </SectionHeader>

      <CompetitionFilters
        pageSize={pageSize}
        sort={sort}
        status={status}
        competitionTypeId={competitionTypeId}
        federationId={federationId}
        countryId={countryId}
        competitionTypes={competitionTypes.map(item => ({ id: item.id, name: item.name }))}
        federations={federations.map(item => ({ id: item.id, name: item.name }))}
        countries={countries.map(item => ({ id: item.id, name: item.name }))}
      />

      {response.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load competitions.</Text>
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
                    Competition type
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Federation
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Country
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
                    <Cell>No competitions found for the current filters.</Cell>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Cell key={`empty-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  response.data.map(item => (
                    <Row key={item.id} href={NAVIGATION.COMPETITION_BY_ID(item.id)}>
                      <Cell className='padding-left--16'>{item.name}</Cell>
                      <Cell className='padding-left--16'>{item.slug}</Cell>
                      <Cell className='padding-left--16'>{item.code}</Cell>
                      <Cell className='padding-left--16'>
                        {competitionTypeLabels.get(item.competitionTypeId) ??
                          item.competitionTypeId}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {item.federationId
                          ? federationLabels.get(item.federationId) ?? item.federationId
                          : PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {item.countryId
                          ? countryLabels.get(item.countryId) ?? item.countryId
                          : PLACEHOLDER}
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
                    competitionTypeId,
                    federationId,
                    countryId,
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
                    competitionTypeId,
                    federationId,
                    countryId,
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
