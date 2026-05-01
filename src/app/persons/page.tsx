/** @format */
/**
 * @file src/app/persons/page.tsx
 * @description Renders the persons list page with localized filters, table labels, and pagination.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

import Link from 'next/link';

import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getAdminPersons } from '@/_actions/person/getAdminPersons';
import Button from '@/_components/forms/Button';
import Dot from '@/_components/Dot';
import Icon from '@/_components/Icon';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Text from '@/_components/typography/Text';
import {
  getPersonCurrentProfessionLabel,
  getPersonGenderLabel,
  parsePersonCurrentProfession,
  parsePersonGender,
  type PersonCurrentProfession,
  type PersonGender,
} from '@/_constants/enums/person';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import requireAdminAccess from '@/_lib/requireAdminAccess';
import type { PersonSort, PersonStatusFilter } from '@/_types/person';
import { getDictionary } from '../../_i18n/getDictionary';
import { resolveRequestLocale } from '../../_i18n/resolveRequestLocale';
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

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  const integer = Math.floor(parsed);

  if (!max) {
    return integer;
  }

  return Math.min(integer, max);
}

function parseString(value: QueryParam): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || raw.length === 0) {
    return undefined;
  }

  return raw;
}

function formatDateTime(value: string, locale: string): string {
  if (!value) {
    return PLACEHOLDER;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return PLACEHOLDER;
  }

  return parsed.toLocaleString(locale);
}

function buildHref(
  page: number,
  pageSize: number,
  sort: PersonSort,
  status?: PersonStatusFilter,
  gender?: PersonGender,
  current_profession?: PersonCurrentProfession,
): string {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);

  if (status) {
    params.set('status', status);
  }

  if (gender) {
    params.set('gender', gender);
  }

  if (current_profession) {
    params.set('current_profession', current_profession);
  }

  return `${NAVIGATION.PERSONS}?${params.toString()}`;
}

function renderAvatarPreview(
  name: string,
  avatarImageUrl: string | null,
  missingLabel: string,
  availableLabel: string,
): React.JSX.Element {
  if (!avatarImageUrl) {
    return (
      <span
        aria-label={missingLabel.replace('{name}', name)}
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
      aria-label={availableLabel.replace('{name}', name)}
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

function formatPaginationLabel(
  template: string,
  currentPage: number,
  totalPages: number,
): string {
  return template
    .replace('{current}', String(currentPage))
    .replace('{total}', String(totalPages));
}

export default async function PersonsPage({
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
    (parseString(params?.sort) as PersonSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as PersonStatusFilter | undefined;
  const gender = parsePersonGender(parseString(params?.gender)) ?? undefined;
  const currentProfession =
    parsePersonCurrentProfession(parseString(params?.current_profession)) ??
    undefined;

  const [personsResponse, countriesResponse] = await Promise.all([
    getAdminPersons({
      page,
      pageSize,
      sort,
      status,
      gender,
      current_profession: currentProfession,
    }),
    getAllCountries(),
  ]);

  const countryLabels = new Map(
    countriesResponse.map(function mapCountryLabel(country) {
      return [country.id, country.name];
    }),
  );
  const { metadata } = personsResponse;
  const currentPage = metadata.page;
  const totalPages = Math.max(1, metadata.totalPages);
  const hasPrev = metadata.hasPreviousPage;
  const hasNext = metadata.hasNextPage;

  return (
    <Grid gap={16}>
      <SectionHeader title={dictionary.persons.sectionTitle} icon='person'>
        <Button icon='plus' href={NAVIGATION.CREATE_A_PERSON}>
          {dictionary.persons.addPerson}
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
            <Text weight='bold'>{dictionary.persons.loadErrorTitle}</Text>
            <Text size='small' color='gray'>
              {resolvePersonErrorMessage(
                personsResponse.error,
                dictionary.persons.errors,
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
                  <Cell header>{dictionary.persons.headers.avatar}</Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.fullName}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.slug}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.displayName}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.gender}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.currentProfession}
                  </Cell>
                  <Cell header className='padding-left--16'>
                    {dictionary.persons.headers.primaryNationality}
                  </Cell>
                  <Cell header align='center'>
                    {dictionary.persons.headers.active}
                  </Cell>
                  <Cell align='right' header className='padding-left--16'>
                    {dictionary.persons.headers.created}
                  </Cell>
                  <Cell align='right' header className='padding-left--16'>
                    {dictionary.persons.headers.updated}
                  </Cell>
                </Row>
              </Thead>
              <Tbody>
                {personsResponse.data.length === 0 ? (
                  <Row>
                    <Cell>{dictionary.persons.emptyState}</Cell>
                    {Array.from({ length: 9 }).map(
                      function renderEmptyCell(_, index): React.JSX.Element {
                        return (
                          <Cell
                            key={`none-${index}`}
                            className='padding-left--16'
                          >
                            {PLACEHOLDER}
                          </Cell>
                        );
                      },
                    )}
                  </Row>
                ) : (
                  personsResponse.data.map(
                    function renderPersonRow(person): React.JSX.Element {
                      return (
                        <Row
                          key={person.id}
                          href={NAVIGATION.PERSON_BY_ID(person.id)}
                        >
                           <Cell>
                             {renderAvatarPreview(
                               person.full_name,
                               person.avatar_image_url ?? null,
                               dictionary.persons.avatarMissing,
                               dictionary.persons.avatarAvailable,
                             )}
                           </Cell>
                           <Cell className='padding-left--16'>
                             {person.full_name}
                           </Cell>
                          <Cell className='padding-left--16'>
                            {person.slug}
                          </Cell>
                          <Cell className='padding-left--16'>
                             {person.display_name || PLACEHOLDER}
                          </Cell>
                          <Cell className='padding-left--16'>
                            {getPersonGenderLabel(person.gender) ?? PLACEHOLDER}
                          </Cell>
                          <Cell className='padding-left--16'>
                             {getPersonCurrentProfessionLabel(
                               person.current_profession,
                             ) ?? PLACEHOLDER}
                           </Cell>
                           <Cell className='padding-left--16'>
                             {person.primary_nationality_country_id
                               ? (countryLabels.get(
                                   person.primary_nationality_country_id,
                                 ) ?? person.primary_nationality_country_id)
                               : PLACEHOLDER}
                           </Cell>
                           <Cell align='center'>
                             {person.is_active ? (
                               <Dot active inline />
                             ) : (
                               <Dot inline />
                             )}
                           </Cell>
                           <Cell align='right' className='padding-left--16'>
                             {formatDateTime(person.created_at, locale)}
                           </Cell>
                           <Cell align='right' className='padding-left--16'>
                             {formatDateTime(person.updated_at, locale)}
                           </Cell>
                        </Row>
                      );
                    },
                  )
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
                  aria-label={dictionary.common.previous}
                >
                  <Icon name='arrowLeft' size={24} fill='gray' />
                </Link>
              ) : null}
              <Text color='gray' size='small' weight='semibold'>
                {formatPaginationLabel(
                  dictionary.persons.paginationLabel,
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
                    status,
                    gender,
                    currentProfession,
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
