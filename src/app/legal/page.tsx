/** @format */

import Link from 'next/link';

import LegalAdminFilters from '@/_components/legal/LegalAdminFilters';
import LegalStatusBadge from '@/_components/legal/LegalStatusBadge';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Icon from '@/_components/Icon';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import type { LegalDocumentType } from '@/_types/legal';
import { listLegalDocuments } from '@/_actions/legal/legalCms';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const EMPTY_VALUE = '--';

type LegalPageSearchParams = Readonly<{
  page?: string | string[];
  limit?: string | string[];
  type?: string | string[];
  version?: string | string[];
}>;

type LegalPageProps = Readonly<{
  searchParams?: Promise<LegalPageSearchParams>;
}>;

function parsePositiveInteger(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return fallback;
}

function parseVersion(value: string | string[] | undefined): number | undefined {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeType(
  value: string | string[] | undefined,
): LegalDocumentType | '' {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (
    normalized === 'TERMS' ||
    normalized === 'PRIVACY' ||
    normalized === 'SUBSCRIPTION'
  ) {
    return normalized;
  }

  return '';
}

function buildPageHref(
  page: number,
  limit: number,
  type: LegalDocumentType | '',
  version?: number,
): string {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  if (type) {
    params.set('type', type);
  }

  if (typeof version === 'number') {
    params.set('version', version.toString());
  }

  return `${NAVIGATION.LEGAL}?${params.toString()}`;
}

function formatDate(value?: string): string {
  if (!value) {
    return EMPTY_VALUE;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return EMPTY_VALUE;
  }

  return parsedDate.toLocaleString();
}

function formatLanguages(value: ReadonlyArray<{ language: string }>): string {
  if (value.length === 0) {
    return EMPTY_VALUE;
  }

  return value.map(function mapTranslation(translation) {
    return translation.language;
  }).join(', ');
}

export default async function LegalDocumentsPage({
  searchParams,
}: LegalPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const page = parsePositiveInteger(resolvedSearchParams?.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(resolvedSearchParams?.limit, DEFAULT_LIMIT);
  const type = normalizeType(resolvedSearchParams?.type);
  const version = parseVersion(resolvedSearchParams?.version);
  const response = await listLegalDocuments({
    page,
    limit,
    type,
    version,
  });
  const { data, pagination } = response;
  const currentPage = pagination.page ?? page;
  const totalPages = Math.max(1, pagination.total_pages ?? 1);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <Grid gap={24}>
      <SectionHeader title={SECTIONS.LEGAL} icon='description'>
        <Button href={NAVIGATION.LEGAL_CREATE}>Create Legal Document</Button>
      </SectionHeader>

      <LegalAdminFilters
        initialType={type}
        initialVersion={version?.toString() ?? ''}
      />

      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Title</Cell>
              <Cell header>Type</Cell>
              <Cell header align='center'>
                Version
              </Cell>
              <Cell header>Status</Cell>
              <Cell header>Languages</Cell>
              <Cell header>Updated</Cell>
            </Row>
          </Thead>
          <Tbody>
            {data.length === 0 ? (
              <Row>
                <Cell>No legal documents available yet.</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell align='center'>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
              </Row>
            ) : (
              data.map(function renderDocumentRow(document) {
                return (
                  <Row
                    key={document.id}
                    href={NAVIGATION.LEGAL_BY_ID(document.id)}
                  >
                    <Cell>{document.title}</Cell>
                    <Cell>{document.type}</Cell>
                    <Cell align='center'>{document.version.toFixed(1)}</Cell>
                    <Cell>
                      <LegalStatusBadge status={document.status} />
                    </Cell>
                    <Cell>{formatLanguages(document.translations)}</Cell>
                    <Cell>{formatDate(document.updated_at)}</Cell>
                  </Row>
                );
              })
            )}
          </Tbody>
        </Table>
      </Main>

      <Grid justifyItems='center' className='margin-block--16'>
        <Grid gap={16} display='flex' alignItems='center'>
          {hasPreviousPage ? (
            <Link
              href={buildPageHref(currentPage - 1, limit, type, version)}
              aria-label='Go to previous page'
            >
              <Icon name='arrowLeft' size={24} fill='gray' />
            </Link>
          ) : null}
          <Text color='gray' size='small' weight='semibold'>
            Page {currentPage} of {totalPages}
          </Text>
          {hasNextPage ? (
            <Link
              href={buildPageHref(currentPage + 1, limit, type, version)}
              aria-label='Go to next page'
            >
              <Icon name='arrowRight' size={24} fill='gray' />
            </Link>
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
}
