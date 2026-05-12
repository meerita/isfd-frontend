/** @format */

import Link from 'next/link';

import { getAdminContributions } from '@/_actions/contribution/getAdminContributions';
import Icon from '@/_components/Icon';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SensitiveValue from '@/_components/SensitiveValue';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import {
  parseContributionAdminReviewStatusFilter,
  parseContributionAdminSort,
  parseContributionAdminTargetEntityTypeFilter,
} from '@/_constants/contribution';
import { resolveContributionErrorMessage } from '@/_constants/contributionErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  ContributionAdminReviewStatusFilter,
  ContributionAdminSort,
  ContributionAdminTargetEntityTypeFilter,
  ContributionTargetEntityType,
  ContributionType,
} from '@/_types/contribution';
import { getDictionary } from '../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../_i18n/resolveRequestLocale';
import ContributionFilters from './_components/ContributionFilters';
import ContributionReviewActions from './_components/ContributionReviewActions';
import ContributionStatusBadge from './_components/ContributionStatusBadge';
import {
  formatDateTime,
  parsePositiveInt,
  parseString,
  PLACEHOLDER,
} from './_components/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: ContributionAdminSort = 'updated_at_desc';
const DEFAULT_REVIEW_STATUS: ContributionAdminReviewStatusFilter = 'pending';
const DEFAULT_TARGET_ENTITY_TYPE: ContributionAdminTargetEntityTypeFilter = 'all';
const EMPTY_ROW_KEYS = [
  'type',
  'target-type',
  'target-id',
  'asset-id',
  'submitted-by',
  'status',
  'created',
  'updated',
  'actions',
] as const;

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  review_status?: string | string[];
  target_entity_type?: string | string[];
}>;

function buildHref(
  page: number,
  pageSize: number,
  sort: ContributionAdminSort,
  reviewStatus: ContributionAdminReviewStatusFilter,
  targetEntityType: ContributionAdminTargetEntityTypeFilter,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  params.set('review_status', reviewStatus);
  params.set('target_entity_type', targetEntityType);
  return `${NAVIGATION.CONTRIBUTIONS}?${params.toString()}`;
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

function getContributionTypeLabel(
  type: ContributionType,
  dictionary: ReturnType<typeof getDictionary>,
): string {
  return type === 'PERSON_PORTRAIT_SUBMISSION'
    ? dictionary.contributions.labels.contributionType.personPortraitSubmission
    : dictionary.contributions.labels.contributionType.stadiumImageSubmission;
}

function getTargetEntityTypeLabel(
  type: ContributionTargetEntityType,
  dictionary: ReturnType<typeof getDictionary>,
): string {
  return type === 'PERSON'
    ? dictionary.contributions.labels.targetEntityType.person
    : dictionary.contributions.labels.targetEntityType.stadium;
}

export default async function ContributionsPage({
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
    parseContributionAdminSort(parseString(params?.sort)) ?? DEFAULT_SORT;
  const reviewStatus =
    parseContributionAdminReviewStatusFilter(parseString(params?.review_status)) ??
    DEFAULT_REVIEW_STATUS;
  const targetEntityType =
    parseContributionAdminTargetEntityTypeFilter(
      parseString(params?.target_entity_type),
    ) ?? DEFAULT_TARGET_ENTITY_TYPE;

  const response = await getAdminContributions({
    page,
    pageSize,
    sort,
    reviewStatus,
    targetEntityType,
  });
  const { metadata } = response;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.contributions.list.title} icon='uploadFile' />

      <ContributionFilters
        pageSize={pageSize}
        sort={sort}
        reviewStatus={reviewStatus}
        targetEntityType={targetEntityType}
      />

      {response.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>{dictionary.contributions.list.loadErrorTitle}</Text>
            <Text size='small' color='gray'>
              {resolveContributionErrorMessage(
                response.error,
                dictionary.contributions.errors,
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
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.id}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.type}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.targetEntityType}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.targetEntityId}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.assetId}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.submittedByUserId}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.reviewStatus}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.createdAt}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.contributions.list.headers.updatedAt}
                  </Cell>
                  <Cell header align='right'>
                    {dictionary.contributions.list.headers.actions}
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {response.data.length === 0 ? (
                  <Row>
                    <Cell>{dictionary.contributions.list.emptyState}</Cell>
                    {EMPTY_ROW_KEYS.map(key => (
                      <Cell key={key} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  response.data.map(item => {
                    const detailHref = NAVIGATION.CONTRIBUTION_BY_ID(item.id);

                    return (
                      <Row key={item.id} href={detailHref}>
                        <Cell className='padding-left--16' title={item.id}>
                          {item.id}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getContributionTypeLabel(item.contributionType, dictionary)}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {getTargetEntityTypeLabel(item.targetEntityType, dictionary)}
                        </Cell>
                        <Cell className='padding-left--16'>
                          <SensitiveValue value={item.targetEntityId} />
                        </Cell>
                        <Cell className='padding-left--16'>
                          <SensitiveValue value={item.assetId} />
                        </Cell>
                        <Cell className='padding-left--16'>
                          <SensitiveValue value={item.submittedByUserId} />
                        </Cell>
                        <Cell className='padding-left--16'>
                          <ContributionStatusBadge status={item.reviewStatus} />
                        </Cell>
                        <Cell className='padding-left--16'>
                          {formatDateTime(item.createdAt, locale)}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {formatDateTime(item.updatedAt, locale)}
                        </Cell>
                        <Cell align='right'>
                          <ContributionReviewActions
                            contributionId={item.id}
                            reviewStatus={item.reviewStatus}
                            targetEntityType={item.targetEntityType}
                            targetEntityId={item.targetEntityId}
                            detailHref={detailHref}
                          />
                        </Cell>
                      </Row>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Main>

          <Grid justifyItems='center' className='margin-block--16'>
            <Grid gap={16} display='flex' alignItems='center'>
              {hasPrev ? (
                <Link
                  href={buildHref(
                    currentPage - 1,
                    pageSize,
                    sort,
                    reviewStatus,
                    targetEntityType,
                  )}
                  aria-label={dictionary.common.previous}
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                {formatPaginationLabel(
                  dictionary.contributions.list.paginationLabel,
                  currentPage,
                  totalPages,
                )}
              </Text>
              {hasNext ? (
                <Link
                  href={buildHref(
                    currentPage + 1,
                    pageSize,
                    sort,
                    reviewStatus,
                    targetEntityType,
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
  );
}
