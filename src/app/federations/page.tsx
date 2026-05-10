/** @format */

import Link from 'next/link';

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminFederations } from '@/_actions/federation/getAdminFederations';
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
import Text from '@/_components/typography/Text';
import Icon from '@/_components/Icon';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import type {
  FederationLevel,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';
import FederationFilters from './_components/FederationFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: FederationSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  federation_level?: string | string[];
}>;

function parsePositiveInt(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseString(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

function formatDateTime(value: string): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return parsed.toLocaleString();
}

function buildHref(
  page: number,
  pageSize: number,
  sort: FederationSort,
  status?: FederationStatusFilter,
  federationLevel?: FederationLevel,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (federationLevel) params.set('federation_level', federationLevel);

  return `${NAVIGATION.FEDERATIONS}?${params.toString()}`;
}

function renderIconPreview(name: string, iconUrl: string | null) {
  if (!iconUrl) {
    return (
      <span
        aria-label={`No icon for ${name}`}
        style={{
          display: 'inline-block',
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#f2f2f2',
        }}
      />
    );
  }

  return (
    <span
      aria-label={`${name} icon`}
      style={{
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${iconUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default async function FederationsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE);
  const sort =
    (parseString(params?.sort) as FederationSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as
    | FederationStatusFilter
    | undefined;
  const federationLevel = parseString(params?.federation_level) as
    | FederationLevel
    | undefined;

  const [federationsResponse, countriesResponse] = await Promise.all([
    getAdminFederations({ page, pageSize, sort, status, federationLevel }),
    getAllCountries(),
  ]);

  const countryLabels = new Map(
    countriesResponse.map(country => [country.id, country.name]),
  );
  const { metadata } = federationsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.FEDERATIONS} icon='admin'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_FEDERATION}>
          {SECTIONS.ADD_FEDERATION}
        </Button>
      </SectionHeader>

      <FederationFilters
        pageSize={pageSize}
        sort={sort}
        status={status}
        federationLevel={federationLevel}
      />

      {federationsResponse.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load federations.</Text>
            <Text size='small' color='gray'>
              {federationsResponse.error.error ||
                federationsResponse.error.message}
            </Text>
          </Grid>
        </Main>
      ) : (
        <>
          <Main>
            <Table>
              <Thead>
                <Row>
                  <Cell header>Icon</Cell>
                  <Cell header className='padding-left--16'>
                    Name
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Slug
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Level
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Country
                  </Cell>
                  <Cell header align='center'>
                    Active
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Created
                  </Cell>
                  <Cell header className='padding-left--16'>
                    Updated
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {federationsResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No federations found for the current filters.</Cell>
                    {Array.from({ length: 7 }).map((_, placeholderIndex) => (
                      <Cell
                        key={`federation-placeholder-${placeholderIndex + 1}`}
                        className='padding-left--16'
                      >
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  federationsResponse.data.map(federation => (
                    <Row
                      key={federation.id}
                      href={NAVIGATION.FEDERATION_BY_ID(federation.id)}
                    >
                      <Cell>
                        {renderIconPreview(federation.name, federation.iconUrl)}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {federation.name}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {federation.slug}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {federation.federationLevel}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {federation.countryId
                          ? (countryLabels.get(federation.countryId) ??
                            federation.countryId)
                          : PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {federation.isActive ? <Dot active inline /> : <Dot inline />}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {formatDateTime(federation.createdAt)}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {formatDateTime(federation.updatedAt)}
                      </Cell>
                    </Row>
                  ))
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
                    status,
                    federationLevel,
                  )}
                  aria-label='Previous'
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                Page {currentPage} of {totalPages}
              </Text>
              {hasNext ? (
                <Link
                  href={buildHref(
                    currentPage + 1,
                    pageSize,
                    sort,
                    status,
                    federationLevel,
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
