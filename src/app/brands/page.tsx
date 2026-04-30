/** @format */

import Link from 'next/link';

import { getAdminBrands } from '@/_actions/brand/getAdminBrands';
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
import { resolveBrandErrorMessage } from '@/_constants/brandErrorMessages';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { BrandSort, BrandStatusFilter } from '@/_types/brand';
import BrandFilters from './_components/BrandFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: BrandSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
}>;

type QueryParam = string | string[] | undefined;

function parsePositiveInt(
  value: QueryParam,
  fallback: number,
  max?: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  const integer = Math.floor(parsed);
  return max ? Math.min(integer, max) : integer;
}

function parseString(value: QueryParam): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

function formatDateOnly(value: string): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function buildHref(
  page: number,
  pageSize: number,
  sort: BrandSort,
  status?: BrandStatusFilter,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);

  return `${NAVIGATION.BRANDS}?${params.toString()}`;
}

export default async function BrandsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort = (parseString(params?.sort) as BrandSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as BrandStatusFilter | undefined;

  const brandsResponse = await getAdminBrands({ page, pageSize, sort, status });
  const { metadata } = brandsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={SECTIONS.BRANDS} icon='brand'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_BRAND}>
          {SECTIONS.ADD_BRAND}
        </Button>
      </SectionHeader>

      <BrandFilters pageSize={pageSize} sort={sort} status={status} />

      {brandsResponse.error ? (
        <Main>
          <Grid gap={8}>
            <Text weight='bold'>We could not load brands.</Text>
            <Text size='small' color='gray'>
              {resolveBrandErrorMessage(brandsResponse.error)}
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
                  <Cell header align='center'>
                    Active
                  </Cell>
                  <Cell align='right' header className='padding-left--16'>
                    Created
                  </Cell>
                  <Cell align='right' header className='padding-left--16'>
                    Updated
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {brandsResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No brands found for the current filters.</Cell>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Cell key={`none-${index}`} className='padding-left--16'>
                        {PLACEHOLDER}
                      </Cell>
                    ))}
                  </Row>
                ) : (
                  brandsResponse.data.map(brand => (
                    <Row key={brand.id} href={NAVIGATION.BRAND_BY_ID(brand.id)}>
                      <Cell className='padding-left--16'>{brand.name}</Cell>
                      <Cell className='padding-left--16'>{brand.slug}</Cell>
                      <Cell align='center'>
                        {brand.isActive ? <Dot active inline /> : <Dot inline />}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatDateOnly(brand.createdAt)}
                      </Cell>
                      <Cell align='right' className='padding-left--16'>
                        {formatDateOnly(brand.updatedAt)}
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
                  href={buildHref(currentPage - 1, pageSize, sort, status)}
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
                  href={buildHref(currentPage + 1, pageSize, sort, status)}
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
