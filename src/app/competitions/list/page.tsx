/** @format */

import Link from 'next/link';

import { getAdminCompetitions } from '@/_actions/competition/getAdminCompetitions';
import { getAllCompetitionTypes } from '@/_actions/competitionType/getAllCompetitionTypes';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAllFederations } from '@/_actions/federation/getAllFederations';
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
import { getCompetitionTypeCodeLabel } from '@/_constants/enums/competition';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { getDictionary } from '@/_i18n/getDictionary';
import { resolveRequestLocale } from '@/_i18n/resolveRequestLocale';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  CompetitionSort,
  CompetitionVisibilityFilter,
} from '@/_types/competition';
import {
  formatDateOnly,
  parsePositiveInt,
  parseString,
  parseUuid,
  PLACEHOLDER,
} from '../_components/utils';
import CompetitionFilters from './_components/CompetitionFilters';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: CompetitionSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  visibility?: string | string[];
  competition_type_id?: string | string[];
  federation_id?: string | string[];
  country_id?: string | string[];
}>;

const SORT_OPTIONS = new Set<CompetitionSort>([
  'created_at_asc',
  'created_at_desc',
  'updated_at_asc',
  'updated_at_desc',
  'is_public_asc',
  'is_public_desc',
  'name_asc',
  'name_desc',
  'sort_order_asc',
  'sort_order_desc',
]);

const VISIBILITY_OPTIONS = new Set<CompetitionVisibilityFilter>([
  'all',
  'public',
  'private',
]);

function buildHref(
  page: number,
  pageSize: number,
  sort: CompetitionSort,
  visibility?: CompetitionVisibilityFilter,
  competitionTypeId?: string,
  federationId?: string,
  countryId?: string,
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);

  if (visibility) {
    params.set('visibility', visibility);
  }

  if (competitionTypeId) {
    params.set('competition_type_id', competitionTypeId);
  }

  if (federationId) {
    params.set('federation_id', federationId);
  }

  if (countryId) {
    params.set('country_id', countryId);
  }

  return `${NAVIGATION.COMPETITIONS_LIST}?${params.toString()}`;
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

export default async function CompetitionsListPage({
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
    rawSort && SORT_OPTIONS.has(rawSort as CompetitionSort)
      ? (rawSort as CompetitionSort)
      : DEFAULT_SORT;
  const rawVisibility = parseString(params?.visibility);
  const visibility =
    rawVisibility && VISIBILITY_OPTIONS.has(rawVisibility as CompetitionVisibilityFilter)
      ? (rawVisibility as CompetitionVisibilityFilter)
      : undefined;
  const competitionTypeId = parseUuid(params?.competition_type_id);
  const federationId = parseUuid(params?.federation_id);
  const countryId = parseUuid(params?.country_id);

  const [response, competitionTypes, federations, countries] =
    await Promise.all([
        getAdminCompetitions({
          page,
          pageSize,
          sort,
          visibility,
          competitionTypeId,
          federationId,
        countryId,
      }),
      getAllCompetitionTypes(),
      getAllFederations(),
      getAllCountries(),
    ]);

  const competitionTypeCodes = new Map(
    competitionTypes.map(item => [item.id, item.code]),
  );
  const federationLabels = new Map(
    federations.map(item => [item.id, item.name]),
  );
  const countryLabels = new Map(countries.map(item => [item.id, item.name]));

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.competitions.list.title} icon='trophy'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_COMPETITION}>
          {dictionary.competitions.list.createAction}
        </Button>
      </SectionHeader>

      <Card>
        <CompetitionFilters
          pageSize={pageSize}
          sort={sort}
          visibility={visibility}
          competitionTypeId={competitionTypeId}
          federationId={federationId}
          countryId={countryId}
          competitionTypes={competitionTypes.map(item => ({
            id: item.id,
            name: item.name,
            code: item.code,
          }))}
          federations={federations.map(item => ({
            id: item.id,
            name: item.name,
          }))}
          countries={countries.map(item => ({ id: item.id, name: item.name }))}
        />

        {response.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>
                {dictionary.competitions.list.loadErrorTitle}
              </Text>
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
                    <Cell header>{dictionary.competitions.list.headers.name}</Cell>
                    <Cell header>
                      {dictionary.competitions.list.headers.competitionType}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.list.headers.federation}
                    </Cell>
                    <Cell header className='padding-left--16'>
                      {dictionary.competitions.list.headers.country}
                    </Cell>
                    <Cell header align='center'>
                      {dictionary.competitions.list.headers.visibility}
                    </Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.list.headers.created}
                    </Cell>
                    <Cell header align='right' className='padding-left--16'>
                      {dictionary.competitions.list.headers.updated}
                    </Cell>
                  </Row>
                </Thead>
                <Tbody>
                  {response.data.length === 0 ? (
                    <Row>
                      <Cell>{dictionary.competitions.list.emptyState}</Cell>
                      {Array.from({ length: 6 }).map((_, index) => (
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
                        href={NAVIGATION.COMPETITION_BY_ID(item.id)}
                      >
                        <Cell>{item.name}</Cell>
                        <Cell>
                          {getCompetitionTypeCodeLabel(
                            competitionTypeCodes.get(item.competitionTypeId) ??
                              item.competitionTypeId,
                            locale,
                          )}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.federationId
                            ? (federationLabels.get(item.federationId) ??
                              item.federationId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {item.countryId
                            ? (countryLabels.get(item.countryId) ??
                              item.countryId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell align='center'>
                          {item.isPublic
                            ? dictionary.competitions.list.visibility.public
                            : dictionary.competitions.list.visibility.private}
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
                        visibility,
                        competitionTypeId,
                      federationId,
                      countryId,
                    )}
                    aria-label={dictionary.common.previous}
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  {formatPaginationLabel(
                    dictionary.competitions.list.paginationLabel,
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
                      visibility,
                      competitionTypeId,
                      federationId,
                      countryId,
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
