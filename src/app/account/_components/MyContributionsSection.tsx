/** @format */

'use client';

import Link from 'next/link';

import Icon from '@/_components/Icon';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import SensitiveValue from '@/_components/SensitiveValue';
import Main from '@/_components/layout/Main';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import { buildAccountHref } from '@/_helpers/account';
import type {
  MeApiResult,
  MyContributionsListResponse,
  MyContributionResponse,
} from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';
import { useMyContributions } from '../_hooks/useMyContributions';
import MyContributionFilters from './MyContributionFilters';

function formatDateTime(value: string | null): string {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatPaginationLabel(currentPage: number, totalPages: number): string {
  return ACCOUNT_COPY.contributions.paginationLabel
    .replace('{current}', String(currentPage))
    .replace('{total}', String(totalPages));
}

function getContributionTypeLabel(value: string): string {
  switch (value) {
    case 'STADIUM_IMAGE_SUBMISSION':
    case 'stadium_image_submission':
      return 'Envío de imagen de estadio';
    case 'PERSON_PORTRAIT_SUBMISSION':
    case 'person_portrait_submission':
      return 'Envío de retrato de persona';
    default:
      return value;
  }
}

function getTargetEntityTypeLabel(value: string): string {
  switch (value) {
    case 'stadium':
    case 'STADIUM':
      return ACCOUNT_COPY.contributions.targetEntityTypeLabels.stadium;
    case 'person':
    case 'PERSON':
      return ACCOUNT_COPY.contributions.targetEntityTypeLabels.person;
    default:
      return value;
  }
}

function getReviewStatusLabel(value: string): string {
  switch (value) {
    case 'pending':
    case 'PENDING':
      return ACCOUNT_COPY.contributions.reviewStatusLabels.pending;
    case 'approved':
    case 'APPROVED':
      return ACCOUNT_COPY.contributions.reviewStatusLabels.approved;
    case 'rejected':
    case 'REJECTED':
      return ACCOUNT_COPY.contributions.reviewStatusLabels.rejected;
    default:
      return value;
  }
}

function hasDirtyFilters(
  metadata: MyContributionsListResponse['metadata'],
): boolean {
  return (
    metadata.filters.review_status !== 'all' ||
    metadata.filters.target_entity_type !== 'all' ||
    metadata.filters.sort !== 'created_at_desc'
  );
}

function ContributionRow({
  contribution,
}: Readonly<{
  contribution: MyContributionResponse;
}>): React.JSX.Element {
  return (
    <Row key={contribution.id}>
      <Cell className='padding-left--16'>{getContributionTypeLabel(contribution.contribution_type)}</Cell>
      <Cell className='padding-left--16'>
        {getTargetEntityTypeLabel(contribution.target_entity_type)}
      </Cell>
      <Cell className='padding-left--16'>
        <SensitiveValue value={contribution.target_entity_id} />
      </Cell>
      <Cell className='padding-left--16'>
        <SensitiveValue value={contribution.asset_id} />
      </Cell>
      <Cell className='padding-left--16'>
        {getReviewStatusLabel(contribution.review_status)}
      </Cell>
      <Cell className='padding-left--16'>
        {formatDateTime(contribution.reviewed_at)}
      </Cell>
      <Cell className='padding-left--16'>
        {formatDateTime(contribution.created_at)}
      </Cell>
      <Cell className='padding-left--16'>
        {formatDateTime(contribution.updated_at)}
      </Cell>
    </Row>
  );
}

export default function MyContributionsSection({
  result,
}: Readonly<{
  result: MeApiResult<MyContributionsListResponse>;
}>): React.JSX.Element {
  const filtersAreDirty = result.data ? hasDirtyFilters(result.data.metadata) : false;
  const { currentPage, totalPages, emptyMessage } = useMyContributions(
    result,
    filtersAreDirty,
  );

  return (
    <Grid gap={16}>
      {result.data ? (
        <MyContributionFilters
          pageSize={result.data.metadata.page_size}
          sort={result.data.metadata.filters.sort}
          reviewStatus={result.data.metadata.filters.review_status}
          targetEntityType={result.data.metadata.filters.target_entity_type}
        />
      ) : null}

      {result.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>{ACCOUNT_COPY.contributions.loadError}</Text>
            <Text size='small' color='gray'>
              {result.error.message}
            </Text>
            <Grid display='flex' gap={8}>
              <Button href={buildAccountHref({ section: 'contributions' })}>
                {ACCOUNT_COPY.contributions.retry}
              </Button>
            </Grid>
          </Grid>
        </Main>
      ) : (
        <>
          <Main>
            <Table>
              <Thead>
                <Row>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.contributionType}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.targetEntityType}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.targetEntityId}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.assetId}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.reviewStatus}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.reviewedAt}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.createdAt}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {ACCOUNT_COPY.labels.updatedAt}
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {result.data && result.data.data.length > 0 ? (
                  result.data.data.map(contribution => (
                    <ContributionRow
                      key={contribution.id}
                      contribution={contribution}
                    />
                  ))
                ) : (
                  <Row>
                    <Cell>{emptyMessage}</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                    <Cell className='padding-left--16'>--</Cell>
                  </Row>
                )}
              </Tbody>
            </Table>
          </Main>

          {result.data && result.data.metadata.total_pages > 1 ? (
            <Grid justifyItems='center' className='margin-block--16'>
              <Grid gap={16} display='flex' alignItems='center'>
                {result.data.metadata.has_previous_page ? (
                  <Link
                    href={buildAccountHref({
                      section: 'contributions',
                      contributions: {
                        page: currentPage - 1,
                        page_size: result.data.metadata.page_size,
                        sort: result.data.metadata.filters.sort,
                        review_status: result.data.metadata.filters.review_status,
                        target_entity_type:
                          result.data.metadata.filters.target_entity_type,
                      },
                    })}
                    aria-label='Anterior'
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  {formatPaginationLabel(currentPage, totalPages)}
                </Text>
                {result.data.metadata.has_next_page ? (
                  <Link
                    href={buildAccountHref({
                      section: 'contributions',
                      contributions: {
                        page: currentPage + 1,
                        page_size: result.data.metadata.page_size,
                        sort: result.data.metadata.filters.sort,
                        review_status: result.data.metadata.filters.review_status,
                        target_entity_type:
                          result.data.metadata.filters.target_entity_type,
                      },
                    })}
                    aria-label='Siguiente'
                  >
                    <Icon name='arrowRight' size={24} fill='gray' />
                  </Link>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </>
      )}
    </Grid>
  );
}
