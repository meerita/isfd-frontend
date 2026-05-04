/** @format */

import Link from 'next/link';

import { getAdminCompetitionPyramids } from '@/_actions/competitionStructure/getAdminCompetitionPyramids';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
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
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import {
  getCompetitionPyramidScopeKindLabel,
  parseCompetitionPyramidScopeKind,
  getCompetitionStructureBranchKindLabel,
  parseCompetitionStructureBranchKind,
} from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
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
import CompetitionPyramidFilters from './_components/CompetitionPyramidFilters';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionStructureSort = 'updated_at_desc';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  country_id?: string | string[];
  federation_id?: string | string[];
  scope_kind?: string | string[];
  branch_kind?: string | string[];
  as_of_date?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionStructureSort,
  status?: CompetitionStructureStatusFilter,
  countryId?: string,
  federationId?: string,
  scopeKind?: string,
  branchKind?: string,
  asOfDate?: string,
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);

  if (status) {
    params.set('status', status);
  }

  if (countryId) {
    params.set('country_id', countryId);
  }

  if (federationId) {
    params.set('federation_id', federationId);
  }

  if (scopeKind) {
    params.set('scope_kind', scopeKind);
  }

  if (branchKind) {
    params.set('branch_kind', branchKind);
  }

  if (asOfDate) {
    params.set('as_of_date', asOfDate);
  }

  return `${NAVIGATION.COMPETITION_PYRAMIDS}?${params.toString()}`;
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

function parseDateFilter(value: string | string[] | undefined): string | undefined {
  const date = parseString(value);
  return date && DATE_PATTERN.test(date) ? date : undefined;
}

function formatValidityRange(validFrom: string, validTo: string | null): string {
  if (!validTo) {
    return formatDateOnly(validFrom);
  }

  return `${formatDateOnly(validFrom)} - ${formatDateOnly(validTo)}`;
}

export default async function CompetitionPyramidsPage({
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
  const countryId = parseUuid(params?.country_id);
  const federationId = parseUuid(params?.federation_id);
  const scopeKind =
    parseCompetitionPyramidScopeKind(parseString(params?.scope_kind)) ?? undefined;
  const branchKind =
    parseCompetitionStructureBranchKind(parseString(params?.branch_kind)) ??
    undefined;
  const asOfDate = parseDateFilter(params?.as_of_date);

  const [response, countries, federations] = await Promise.all([
    getAdminCompetitionPyramids({
      page,
      pageSize,
      sort,
      status,
      countryId,
      federationId,
      scopeKind,
      branchKind,
      asOfDate,
    }),
    getAllCountries(),
    getAllFederations(),
  ]);

  const countryLabels = new Map(countries.map(item => [item.id, item.name]));
  const federationLabels = new Map(
    federations.map(item => [item.id, item.name]),
  );

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.competitions.pyramids.title} icon='group'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION_PYRAMID}>
          {dictionary.competitions.pyramids.createAction}
        </Button>
      </SectionHeader>

      <Card>
        <CompetitionPyramidFilters
          pageSize={pageSize}
          sort={sort}
          status={status}
          countryId={countryId}
          federationId={federationId}
          scopeKind={scopeKind}
          branchKind={branchKind}
          asOfDate={asOfDate}
          countries={countries.map(item => ({ id: item.id, name: item.name }))}
          federations={federations.map(item => ({
            id: item.id,
            name: item.name,
          }))}
        />

        {response.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>
                {dictionary.competitions.pyramids.loadErrorTitle}
              </Text>
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
                    <Cell header>{dictionary.competitions.pyramids.headers.name}</Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.country}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.federation}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.scope}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.branch}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.validity}
                    </Cell>
                    <Cell header align='center'>
                      {dictionary.competitions.pyramids.headers.active}
                    </Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.pyramids.headers.updated}
                    </Cell>
                  </Row>
                </Thead>
                <Tbody>
                  {response.data.length === 0 ? (
                    <Row>
                      <Cell>{dictionary.competitions.pyramids.emptyState}</Cell>
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
                        href={NAVIGATION.COMPETITION_PYRAMID_BY_ID(item.id)}
                      >
                        <Cell>{item.name}</Cell>
                        <Cell className='padding-left--16'>
                          {countryLabels.get(item.countryId) ?? item.countryId}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.federationId
                            ? (federationLabels.get(item.federationId) ??
                              item.federationId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getCompetitionPyramidScopeKindLabel(item.scopeKind, locale)}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.branchKind
                            ? getCompetitionStructureBranchKindLabel(
                                item.branchKind,
                                locale,
                              )
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {formatValidityRange(item.validFrom, item.validTo)}
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
                      countryId,
                      federationId,
                      scopeKind,
                      branchKind,
                      asOfDate,
                    )}
                    aria-label={dictionary.common.previous}
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  {formatPaginationLabel(
                    dictionary.competitions.pyramids.paginationLabel,
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
                      countryId,
                      federationId,
                      scopeKind,
                      branchKind,
                      asOfDate,
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
