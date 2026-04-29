/** @format */

import Link from 'next/link';

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getMe } from '@/_actions/auth/getMe';
import { getAdminClubs } from '@/_actions/club/getAdminClubs';
import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
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
import SECTIONS from '@/_constants/sections';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { ClubSort, ClubStatusFilter } from '@/_types/club';
import ClubAdminShell from './_components/ClubAdminShell';
import ClubFilters from './_components/ClubFilters';
import Dot from '@/_components/Dot';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: ClubSort = 'updated_at_desc';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  country_id?: string | string[];
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

function parseUuid(value: QueryParam): string | undefined {
  const parsed = parseString(value);
  return parsed && UUID_PATTERN.test(parsed) ? parsed : undefined;
}

function formatDateOnly(value: string): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  // Format as M/D/YYYY (no time)
  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function buildHref(
  page: number,
  pageSize: number,
  sort: ClubSort,
  status?: ClubStatusFilter,
  countryId?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (countryId) params.set('country_id', countryId);

  return `${NAVIGATION.CLUBS}?${params.toString()}`;
}

function renderLogoPreview(name: string, logoUrl: string | null) {
  if (!logoUrl) {
    return (
      <span
        aria-label={`No logo for ${name}`}
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
      aria-label={`${name} logo`}
      style={{
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${logoUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default async function ClubsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as ClubSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as ClubStatusFilter | undefined;
  const countryId = parseUuid(params?.country_id);

  const [user, clubsResponse, countriesResponse] = await Promise.all([
    getMe(),
    getAdminClubs({ page, pageSize, sort, status, countryId }),
    getAllCountries(),
  ]);

  const uniqueCountryIds = Array.from(
    new Set(
      clubsResponse.data
        .map(club => club.countryId)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const citiesByCountryResponses = await Promise.all(
    uniqueCountryIds.map(async currentCountryId => ({
      countryId: currentCountryId,
      response: await getGeoCitiesByCountry(currentCountryId),
    })),
  );

  const countryLabels = new Map(
    countriesResponse.map(country => [country.id, country.name]),
  );
  const cityLabels = new Map<string, string>();

  for (const { response } of citiesByCountryResponses) {
    for (const city of response.data) {
      cityLabels.set(city.id, city.name);
    }
  }

  const { metadata } = clubsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <ClubAdminShell username={user?.username ?? 'User'}>
      <Grid gap={16}>
        <SectionHeader title={SECTIONS.CLUBS} icon='club'>
          <Button icon='plus' href={NAVIGATION.CREATE_A_CLUB}>
            {SECTIONS.ADD_CLUB}
          </Button>
        </SectionHeader>

        <ClubFilters
          pageSize={pageSize}
          sort={sort}
          status={status}
          countryId={countryId}
          countries={countriesResponse}
        />

        {clubsResponse.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>We could not load clubs.</Text>
              <Text size='small' color='gray'>
                {resolveClubErrorMessage(clubsResponse.error)}
              </Text>
            </Grid>
          </Main>
        ) : (
          <>
            <Main>
              <Table>
                <Thead>
                  <Row>
                    <Cell header>Logo</Cell>
                    <Cell header className='padding-left--16'>
                      Name
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Slug
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Short name
                    </Cell>
                    <Cell header align='center'>
                      Active
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Country
                    </Cell>
                    <Cell header className='padding-left--16'>
                      City
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Primary stadium
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
                  {clubsResponse.data.length === 0 ? (
                    <Row>
                      <Cell>No clubs found for the current filters.</Cell>
                      {Array.from({ length: 9 }).map((_, index) => (
                        <Cell
                          key={`none-${index}`}
                          className='padding-left--16'
                        >
                          {PLACEHOLDER}
                        </Cell>
                      ))}
                    </Row>
                  ) : (
                    clubsResponse.data.map(club => (
                      <Row key={club.id} href={NAVIGATION.CLUB_BY_ID(club.id)}>
                        <Cell>
                          {renderLogoPreview(club.name, club.logoUrl)}
                        </Cell>
                        <Cell className='padding-left--16'>{club.name}</Cell>
                        <Cell className='padding-left--16'>{club.slug}</Cell>
                        <Cell className='padding-left--16'>
                          {club.shortName ?? PLACEHOLDER}
                        </Cell>
                        <Cell align='center'>
                          {club.isActive ? (
                            <Dot active inline />
                          ) : (
                            <Dot inline />
                          )}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {club.countryId
                            ? (countryLabels.get(club.countryId) ??
                              club.countryId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {club.cityId
                            ? (cityLabels.get(club.cityId) ?? club.cityId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {club.primaryStadiumId ?? PLACEHOLDER}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {formatDateOnly(club.createdAt)}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {formatDateOnly(club.updatedAt)}
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
                      countryId,
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
    </ClubAdminShell>
  );
}
