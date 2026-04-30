/** @format */

import Link from 'next/link';

import { getMe } from '@/_actions/auth/getMe';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminPersons } from '@/_actions/person/getAdminPersons';
import Button from '@/_components/forms/Button';
import Dot from '@/_components/Dot';
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
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import SECTIONS from '@/_constants/sections';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type {
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';
import ClubAdminShell from '../clubs/_components/ClubAdminShell';
import PersonFilters from './_components/PersonFilters';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: PersonSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  status?: string | string[];
  gender?: string | string[];
  current_profession?: string | string[];
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

function formatDateTime(value: string): string {
  if (!value) return PLACEHOLDER;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return PLACEHOLDER;

  return parsed.toLocaleString();
}

function buildHref(
  page: number,
  pageSize: number,
  sort: PersonSort,
  status?: PersonStatusFilter,
  gender?: string,
  currentProfession?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (status) params.set('status', status);
  if (gender) params.set('gender', gender);
  if (currentProfession) {
    params.set('current_profession', currentProfession);
  }

  return `${NAVIGATION.PERSONS}?${params.toString()}`;
}

function renderAvatarPreview(name: string, avatarImageUrl: string | null) {
  if (!avatarImageUrl) {
    return (
      <span
        aria-label={`No avatar for ${name}`}
        style={{
          display: 'inline-block',
          width: 32,
          height: 32,
          borderRadius: 999,
          backgroundColor: '#f2f2f2',
        }}
      />
    );
  }

  return (
    <span
      aria-label={`${name} avatar`}
      style={{
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${avatarImageUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default async function PersonsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  await requireAdminAccess();

  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as PersonSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as PersonStatusFilter | undefined;
  const gender = parseString(params?.gender);
  const currentProfession = parseString(params?.current_profession);

  const [user, personsResponse, countriesResponse] = await Promise.all([
    getMe(),
    getAdminPersons({
      page,
      pageSize,
      sort,
      status,
      gender,
      currentProfession,
    }),
    getAllCountries(),
  ]);

  const countryLabels = new Map(
    countriesResponse.map(country => [country.id, country.name]),
  );
  const { metadata } = personsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <ClubAdminShell username={user?.username ?? 'User'}>
      <Grid gap={16}>
        <SectionHeader title={SECTIONS.PERSONS} icon='person'>
          <Button icon='plus' href={NAVIGATION.CREATE_A_PERSON}>
            {SECTIONS.ADD_PERSON}
          </Button>
        </SectionHeader>

        <PersonFilters
          pageSize={pageSize}
          sort={sort}
          status={status}
          gender={gender}
          currentProfession={currentProfession}
        />

        {personsResponse.error ? (
          <Main>
            <Grid gap={8}>
              <Text weight='bold'>We could not load persons.</Text>
              <Text size='small' color='gray'>
                {resolvePersonErrorMessage(personsResponse.error)}
              </Text>
            </Grid>
          </Main>
        ) : (
          <>
            <Main>
              <Table>
                <Thead>
                  <Row>
                    <Cell header>Avatar</Cell>
                    <Cell header className='padding-left--16'>
                      Full name
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Slug
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Display name
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Gender
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Current profession
                    </Cell>
                    <Cell header className='padding-left--16'>
                      Primary nationality
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
                  {personsResponse.data.length === 0 ? (
                    <Row>
                      <Cell>No persons found for the current filters.</Cell>
                      {Array.from({ length: 9 }).map((_, index) => (
                        <Cell key={`none-${index}`} className='padding-left--16'>
                          {PLACEHOLDER}
                        </Cell>
                      ))}
                    </Row>
                  ) : (
                    personsResponse.data.map(person => (
                      <Row
                        key={person.id}
                        href={NAVIGATION.PERSON_BY_ID(person.id)}
                      >
                        <Cell>
                          {renderAvatarPreview(
                            person.fullName,
                            person.avatarImageUrl,
                          )}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {person.fullName}
                        </Cell>
                        <Cell className='padding-left--16'>{person.slug}</Cell>
                        <Cell className='padding-left--16'>
                          {person.displayName || PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {person.gender || PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {person.currentProfession ?? PLACEHOLDER}
                        </Cell>
                        <Cell className='padding-left--16'>
                          {person.primaryNationalityCountryId
                            ? (countryLabels.get(
                                person.primaryNationalityCountryId,
                              ) ?? person.primaryNationalityCountryId)
                            : PLACEHOLDER}
                        </Cell>
                        <Cell align='center'>
                          {person.isActive ? <Dot active inline /> : <Dot inline />}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {formatDateTime(person.createdAt)}
                        </Cell>
                        <Cell align='right' className='padding-left--16'>
                          {formatDateTime(person.updatedAt)}
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
                      gender,
                      currentProfession,
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
                      gender,
                      currentProfession,
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
