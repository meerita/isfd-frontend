/** @format */

import Link from 'next/link';

import { getCityById } from '@/_actions/city/getCityById';
import { getAllCountries } from '@/_actions/country/getAllCountries';
import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getPublicStadiums } from '@/_actions/stadium/getPublicStadiums';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import Icon from '@/_components/Icon';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { getStadiumSurfaceTypeLabel } from '@/_constants/enums/stadium';
import NAVIGATION from '@/_constants/navigation';
import { parseUuid } from '@/_helpers/uuid';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import type { StadiumPublicSort } from '@/_types/stadium';

const PLACEHOLDER = '--';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: StadiumPublicSort = 'updated_at_desc';

type SearchParams = Readonly<{
  page?: string | string[];
  page_size?: string | string[];
  sort?: string | string[];
  country_id?: string | string[];
  city_id?: string | string[];
}>;

type QueryParam = string | string[] | undefined;

function parsePositiveInt(value: QueryParam, fallback: number, max?: number): number {
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

function buildHref(
  page: number,
  pageSize: number,
  sort: StadiumPublicSort,
  countryId?: string,
  cityId?: string,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  params.set('sort', sort);
  if (countryId) params.set('country_id', countryId);
  if (cityId) params.set('city_id', cityId);
  return `${NAVIGATION.STADIUMS_PUBLIC}?${params.toString()}`;
}

function renderImage(url: string | null, label: string) {
  if (!url) {
    return (
      <div
        aria-label={`No image for ${label}`}
        style={{
          width: '100%',
          minHeight: 220,
          borderRadius: 16,
          backgroundColor: '#f2f2f2',
        }}
      />
    );
  }

  return (
    <div
      aria-label={label}
      role='img'
      style={{
        width: '100%',
        minHeight: 220,
        borderRadius: 16,
        backgroundColor: '#f2f2f2',
        backgroundImage: `url(${url})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    />
  );
}

export default async function PublicStadiumsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>) {
  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE, 100);
  const sort =
    (parseString(params?.sort) as StadiumPublicSort | undefined) ?? DEFAULT_SORT;
  const countryId = parseUuid(params?.country_id);
  const cityId = parseUuid(params?.city_id);

  const [stadiumsResponse, countries, selectedCity, citiesResponse] = await Promise.all([
    getPublicStadiums({
      page,
      page_size: pageSize,
      sort,
      country_id: countryId,
      city_id: cityId,
    }),
    getAllCountries(),
    cityId ? getCityById(cityId) : Promise.resolve(null),
    countryId ? getGeoCitiesByCountry(countryId) : Promise.resolve(null),
  ]);

  const currentPage = stadiumsResponse.metadata.page;
  const totalPages = Math.max(1, stadiumsResponse.metadata.total_pages);

  return (
    <Main className='padding--32'>
      <Grid gap={24} className='max-width--75 margin-inline--auto'>
        <Grid gap={8}>
          <Title size='large'>Stadiums</Title>
          <Text color='gray'>
            Browse the public stadium catalog using the live backend contract.
          </Text>
        </Grid>

        <form method='GET' action={NAVIGATION.STADIUMS_PUBLIC}>
          <Grid gap={16} columns={4} alignItems='end'>
            <input type='hidden' name='page' value='1' />
            <input type='hidden' name='page_size' value={String(pageSize)} />
            <label>
              <Text size='small' weight='semibold'>
                Sort
              </Text>
              <select name='sort' defaultValue={sort}>
                <option value='updated_at_desc'>Updated ↓</option>
                <option value='name_asc'>Name A-Z</option>
                <option value='name_desc'>Name Z-A</option>
              </select>
            </label>
            <label>
              <Text size='small' weight='semibold'>
                Country
              </Text>
              <select name='country_id' defaultValue={countryId ?? ''}>
                <option value=''>All countries</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <Text size='small' weight='semibold'>
                City
              </Text>
              <select name='city_id' defaultValue={cityId ?? ''}>
                <option value=''>All cities</option>
                {(citiesResponse?.data ?? []).map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
                {cityId &&
                !citiesResponse?.data.some(city => city.id === cityId) &&
                selectedCity ? (
                  <option value={selectedCity.id}>{selectedCity.name}</option>
                ) : null}
              </select>
            </label>
            <Grid display='flex' gap={8}>
              <Button type='submit'>Apply</Button>
              <Button href={NAVIGATION.STADIUMS_PUBLIC} variant='borderless'>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>

        {stadiumsResponse.error ? (
          <Grid gap={8}>
            <Title size='medium'>We could not load stadiums.</Title>
            <Text color='gray'>
              {resolveStadiumErrorMessage(stadiumsResponse.error)}
            </Text>
          </Grid>
        ) : stadiumsResponse.data.length === 0 ? (
          <Grid gap={8}>
            <Title size='medium'>No stadiums found.</Title>
            <Text color='gray'>Try adjusting the current filters.</Text>
          </Grid>
        ) : (
          <Grid gap={24}>
            <Grid gap={24} columns={2}>
              {stadiumsResponse.data.map(stadium => (
                <Grid key={stadium.slug} gap={16}>
                  {renderImage(
                    stadium.primary_image?.url ?? null,
                    `${stadium.name} primary image`,
                  )}
                  <Grid gap={8}>
                    <Title size='medium' as='h2'>
                      {stadium.name}
                    </Title>
                    <Text color='gray'>
                      {stadium.primary_club?.name ??
                        stadium.city?.name ??
                        stadium.slug}
                    </Text>
                  </Grid>
                  <Grid gap={6}>
                    <Text>
                      <strong>Country:</strong>{' '}
                      {stadium.country?.name ?? PLACEHOLDER}
                    </Text>
                    <Text>
                      <strong>City:</strong> {stadium.city?.name ?? PLACEHOLDER}
                    </Text>
                    <Text>
                      <strong>Surface:</strong>{' '}
                      {getStadiumSurfaceTypeLabel(stadium.surface_type) ??
                        PLACEHOLDER}
                    </Text>
                    <Text>
                      <strong>Seats:</strong>{' '}
                      {stadium.seat_count?.toLocaleString() ?? PLACEHOLDER}
                    </Text>
                  </Grid>
                  <Grid justifyItems='start'>
                    <Button href={NAVIGATION.STADIUM_BY_SLUG(stadium.slug)}>
                      Open stadium
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>

            <Grid justifyItems='center'>
              <Grid gap={16} display='flex' alignItems='center'>
                {stadiumsResponse.metadata.has_previous_page ? (
                  <Link
                    href={buildHref(currentPage - 1, pageSize, sort, countryId, cityId)}
                    aria-label='Previous page'
                  >
                    <Icon name='arrowLeft' size={24} fill='gray' />
                  </Link>
                ) : null}
                <Text color='gray' size='small' weight='semibold'>
                  Page {currentPage} of {totalPages}
                </Text>
                {stadiumsResponse.metadata.has_next_page ? (
                  <Link
                    href={buildHref(currentPage + 1, pageSize, sort, countryId, cityId)}
                    aria-label='Next page'
                  >
                    <Icon name='arrowRight' size={24} fill='gray' />
                  </Link>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Main>
  );
}
