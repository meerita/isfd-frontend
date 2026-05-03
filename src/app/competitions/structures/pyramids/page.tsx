/** @format */

import Link from 'next/link';

import { getAdminCompetitionPyramids } from '@/_actions/competitionStructure/getAdminCompetitionPyramids';
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
import { getCompetitionScopeKindLabel } from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
} from '@/_types/competitionStructure';
import CompetitionPyramidFilters from './_components/CompetitionPyramidFilters';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  parseUuid,
  PLACEHOLDER,
} from '../../_components/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionStructureSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  country_id?: string | string[];
  federation_id?: string | string[];
  scope_kind?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionStructureSort,
  status?: CompetitionStructureStatusFilter,
  countryId?: string,
  federationId?: string,
  scopeKind?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (countryId) params.set('country_id', countryId);
  if (federationId) params.set('federation_id', federationId);
  if (scopeKind) params.set('scope_kind', scopeKind);

  return `${NAVIGATION.COMPETITION_PYRAMIDS}?${params.toString()}`;
}

export default async function CompetitionPyramidsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as CompetitionStructureSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as
    | CompetitionStructureStatusFilter
    | undefined;
  const countryId = parseUuid(params?.country_id);
  const federationId = parseUuid(params?.federation_id);
  const scopeKind = parseString(params?.scope_kind);

  const [response, countries, federations] = await Promise.all([
    getAdminCompetitionPyramids({
      page,
      pageSize,
      sort,
      status,
      countryId,
      federationId,
      scopeKind,
    }),
    getAllCountries(),
    getAllFederations(),
  ]);

  const countryLabels = new Map(countries.map(item => [item.id, item.name]));
  const federationLabels = new Map(federations.map(item => [item.id, item.name]));

  return (
    <Grid gap={16}>
      <SectionHeader title='Competition pyramids' icon='group'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_PYRAMID}>
          Create competition pyramid
        </Button>
      </SectionHeader>

      <CompetitionPyramidFilters
        pageSize={pageSize}
        sort={sort}
        status={status}
        countryId={countryId}
        federationId={federationId}
        scopeKind={scopeKind}
        countries={countries.map(item => ({ id: item.id, name: item.name }))}
        federations={federations.map(item => ({ id: item.id, name: item.name }))}
      />

      {response.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load competition pyramids.</Text>
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
                    Country
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Federation
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Scope
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
                    <Cell>No competition pyramids found for the current filters.</Cell>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Cell key={`empty-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  response.data.map(item => (
                    <Row
                      key={item.id}
                      href={NAVIGATION.COMPETITION_PYRAMID_BY_ID(item.id)}
                    >
                      <Cell className='padding-left--16'>{item.name}</Cell>
                      <Cell className='padding-left--16'>{item.slug}</Cell>
                      <Cell className='padding-left--16'>{item.code}</Cell>
                      <Cell className='padding-left--16'>
                        {countryLabels.get(item.countryId) ?? item.countryId}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {item.federationId
                          ? federationLabels.get(item.federationId) ?? item.federationId
                          : PLACEHOLDER}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {getCompetitionScopeKindLabel(item.scopeKind)}
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
                    countryId,
                    federationId,
                    scopeKind,
                  )}
                  aria-label='Previous'
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                Page {response.metadata.page} of {Math.max(1, response.metadata.totalPages)}
              </Text>
              {response.metadata.hasNextPage ? (
                <Link
                  href={buildHref(
                    response.metadata.page + 1,
                    pageSize,
                    sort,
                    status,
                    countryId,
                    federationId,
                    scopeKind,
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
