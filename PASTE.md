## `src/_types/federation.ts`

```
/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type FederationLevel = 'WORLD' | 'CONTINENTAL' | 'NATIONAL';

export type FederationSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'name_asc'
  | 'name_desc';

export type FederationStatusFilter = 'all' | 'active' | 'inactive';

export type FederationListItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  federationLevel: FederationLevel;
  iconUrl: string | null;
  countryId: string | null;
  cityId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Federation = FederationListItem &
  Readonly<{
    nativeName: string | null;
    shortName: string | null;
    acronym: string | null;
    foundationDate: string | null;
    description: string | null;
    officialWebsiteUrl: string | null;
    heroImageUrl: string | null;
  }>;

export type FederationListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: FederationSort;
      status?: FederationStatusFilter;
      federationLevel?: FederationLevel;
    }>;
  }>;

export type FederationListResponse = Readonly<{
  data: ReadonlyArray<FederationListItem>;
  metadata: FederationListMetadata;
  error?: ApiErrorResponse;
}>;

export type FederationDetailResponse = Readonly<{
  data: Federation | null;
  error?: ApiErrorResponse;
}>;

export interface FederationActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  federationId?: string;
}

```

## `src/_actions/federation/mappers.ts`

```
/** @format */

import type {
  Federation,
  FederationLevel,
  FederationListItem,
  FederationListMetadata,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';

type RawFederation = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toFederationLevel(value: unknown): FederationLevel {
  if (value === 'WORLD' || value === 'CONTINENTAL' || value === 'NATIONAL') {
    return value;
  }

  return 'NATIONAL';
}

export function mapFederationListItem(raw: RawFederation): FederationListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    federationLevel: toFederationLevel(raw.federation_level ?? raw.federationLevel),
    iconUrl: toNullableString(raw.icon_url ?? raw.iconUrl),
    countryId: toNullableString(raw.country_id ?? raw.countryId),
    cityId: toNullableString(raw.city_id ?? raw.cityId),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

export function mapFederation(raw: RawFederation): Federation {
  const summary = mapFederationListItem(raw);

  return {
    ...summary,
    nativeName: toNullableString(raw.native_name ?? raw.nativeName),
    shortName: toNullableString(raw.short_name ?? raw.shortName),
    acronym: toNullableString(raw.acronym),
    foundationDate: toNullableString(raw.foundation_date ?? raw.foundationDate),
    description: toNullableString(raw.description),
    officialWebsiteUrl: toNullableString(
      raw.official_website_url ?? raw.officialWebsiteUrl,
    ),
    heroImageUrl: toNullableString(raw.hero_image_url ?? raw.heroImageUrl),
  };
}

export function mapFederationMetadata(
  raw: Record<string, unknown>,
): FederationListMetadata {
  const filters =
    typeof raw.filters === 'object' && raw.filters !== null
      ? (raw.filters as Record<string, unknown>)
      : null;

  const mappedFilters = filters
    ? {
        sort:
          typeof filters.sort === 'string'
            ? (filters.sort as FederationSort)
            : undefined,
        status:
          typeof filters.status === 'string'
            ? (filters.status as FederationStatusFilter)
            : undefined,
        federationLevel:
          typeof filters.federation_level === 'string'
            ? toFederationLevel(filters.federation_level)
            : typeof filters.federationLevel === 'string'
              ? toFederationLevel(filters.federationLevel)
              : undefined,
      }
    : undefined;

  return {
    page: Number(raw.page ?? DEFAULT_PAGE),
    pageSize: Number(raw.page_size ?? raw.pageSize ?? DEFAULT_PAGE_SIZE),
    totalItems: Number(raw.total_items ?? raw.totalItems ?? 0),
    totalPages: Number(raw.total_pages ?? raw.totalPages ?? 1),
    hasNextPage: Boolean(raw.has_next_page ?? raw.hasNextPage ?? false),
    hasPreviousPage: Boolean(
      raw.has_previous_page ?? raw.hasPreviousPage ?? false,
    ),
    filters: mappedFilters,
  };
}

```

## `src/_actions/federation/payload.ts`

```
/** @format */

import type { FederationActionState, FederationLevel } from '@/_types/federation';

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function bool(formData: FormData, key: string, fallback = false): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') return fallback;

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

function validateLevel(level: string): FederationLevel | null {
  if (level === 'WORLD' || level === 'CONTINENTAL' || level === 'NATIONAL') {
    return level;
  }

  return null;
}

function formError(
  reason: string,
  message: string,
  error: string,
): FederationActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
}

export function buildCreateFederationBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: FederationActionState } {
  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'FEDERATION_NAME_REQUIRED',
        'Federation name is required.',
        'Federation name is required.',
      ),
    };
  }

  const federationLevel = validateLevel(str(formData, 'federationLevel'));
  if (!federationLevel) {
    return {
      error: formError(
        'FEDERATION_INVALID_LEVEL',
        'Federation level is required.',
        'Select a valid federation level.',
      ),
    };
  }

  const countryId = str(formData, 'countryId');
  const cityId = str(formData, 'cityId');
  if (cityId && !countryId) {
    return {
      error: formError(
        'FEDERATION_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  const rawFoundationDate = str(formData, 'foundationDate');
  const foundationDate = normalizeDateInput(rawFoundationDate);
  if (rawFoundationDate && !foundationDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Foundation date must use YYYY-MM-DD.',
        'Enter a valid foundation date in YYYY-MM-DD format.',
      ),
    };
  }

  const body: Record<string, unknown> = {
    name,
    federation_level: federationLevel,
    is_active: bool(formData, 'isActive', true),
  };

  const nativeName = optionalString(str(formData, 'nativeName'));
  const shortName = optionalString(str(formData, 'shortName'));
  const acronym = optionalString(str(formData, 'acronym'));
  const description = optionalString(str(formData, 'description'));
  const officialWebsiteUrl = optionalString(str(formData, 'officialWebsiteUrl'));
  const iconUrl = optionalString(str(formData, 'iconUrl'));
  const heroImageUrl = optionalString(str(formData, 'heroImageUrl'));

  if (nativeName !== null) body.native_name = nativeName;
  if (shortName !== null) body.short_name = shortName;
  if (acronym !== null) body.acronym = acronym;
  if (countryId) body.country_id = countryId;
  if (countryId && cityId) body.city_id = cityId;
  if (foundationDate !== null) body.foundation_date = foundationDate;
  if (description !== null) body.description = description;
  if (officialWebsiteUrl !== null) body.official_website_url = officialWebsiteUrl;
  if (iconUrl !== null) body.icon_url = iconUrl;
  if (heroImageUrl !== null) body.hero_image_url = heroImageUrl;

  return { body };
}

export function buildUpdateFederationBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: FederationActionState; federationId?: string } {
  const federationId = str(formData, 'federationId');
  if (!federationId) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Missing federation identifier.',
        'Federation identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'FEDERATION_NAME_REQUIRED',
        'Federation name is required.',
        'Federation name is required.',
      ),
      federationId,
    };
  }

  const federationLevel = validateLevel(str(formData, 'federationLevel'));
  if (!federationLevel) {
    return {
      error: formError(
        'FEDERATION_INVALID_LEVEL',
        'Federation level is required.',
        'Select a valid federation level.',
      ),
      federationId,
    };
  }

  const countryId = optionalString(str(formData, 'countryId'));
  const cityId = optionalString(str(formData, 'cityId'));
  if (cityId && !countryId) {
    return {
      error: formError(
        'FEDERATION_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
      federationId,
    };
  }

  const rawFoundationDate = str(formData, 'foundationDate');
  const foundationDate = normalizeDateInput(rawFoundationDate);
  if (rawFoundationDate && !foundationDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Foundation date must use YYYY-MM-DD.',
        'Enter a valid foundation date in YYYY-MM-DD format.',
      ),
      federationId,
    };
  }

  return {
    federationId,
    body: {
      name,
      native_name: optionalString(str(formData, 'nativeName')),
      short_name: optionalString(str(formData, 'shortName')),
      acronym: optionalString(str(formData, 'acronym')),
      federation_level: federationLevel,
      country_id: countryId,
      city_id: countryId ? cityId : null,
      foundation_date: rawFoundationDate ? foundationDate : null,
      description: optionalString(str(formData, 'description')),
      official_website_url: optionalString(str(formData, 'officialWebsiteUrl')),
      icon_url: optionalString(str(formData, 'iconUrl')),
      hero_image_url: optionalString(str(formData, 'heroImageUrl')),
      is_active: bool(formData, 'isActive', false),
    },
  };
}

```

## `src/_actions/federation/getAdminFederations.ts`

```
/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  FederationLevel,
  FederationListResponse,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';
import { mapFederationListItem, mapFederationMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: FederationSort;
  status?: FederationStatusFilter;
  federationLevel?: FederationLevel;
}): FederationListResponse {
  return {
    data: [],
    metadata: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filters,
    },
  };
}

export async function getAdminFederations(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: FederationSort;
    status?: FederationStatusFilter;
    federationLevel?: FederationLevel;
  }> = {},
): Promise<FederationListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    federationLevel,
  } = query;
  const filters = { sort, status, federationLevel };
  const client = await getServerAxios();
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (federationLevel) params.federation_level = federationLevel;

  try {
    const { data } = await client.get<unknown>(API_ROUTES.FEDERATIONS_ADMIN, {
      params,
    });

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return {
        ...buildEmptyResponse(filters),
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid federations response.',
          error: 'The federations list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapFederationListItem),
      metadata: raw.metadata
        ? mapFederationMetadata(raw.metadata)
        : buildEmptyResponse(filters).metadata,
    };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return {
      ...buildEmptyResponse(filters),
      error: normalized.data,
    };
  }
}

```

## `src/_actions/federation/getAdminFederationById.ts`

```
/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationDetailResponse } from '@/_types/federation';
import { mapFederation } from './mappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.federation) &&
    typeof payload.federation.id === 'string'
  ) {
    return payload.federation;
  }

  return null;
}

export async function getAdminFederationById(
  federationId: string,
): Promise<FederationDetailResponse> {
  if (!federationId) {
    return {
      data: null,
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing federation identifier.',
        error: 'Federation identifier is required.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId),
    );
    const raw = extractRaw(data);

    if (!raw) {
      return {
        data: null,
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid federation response.',
          error: 'The federation detail response was not valid.',
        },
      };
    }

    return { data: mapFederation(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return {
      data: null,
      error: normalized.data,
    };
  }
}

```

## `src/_actions/federation/createFederation.ts`

```
/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationActionState } from '@/_types/federation';
import { mapFederation } from './mappers';
import { buildCreateFederationBody } from './payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function extractRaw(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.id === 'string') return payload;
  if (isRecord(payload.data) && typeof payload.data.id === 'string') return payload.data;
  if (
    isRecord(payload.federation) &&
    typeof payload.federation.id === 'string'
  ) {
    return payload.federation;
  }

  return null;
}

export async function createFederation(
  _prevState: FederationActionState,
  formData: FormData,
): Promise<FederationActionState> {
  const { body, error } = buildCreateFederationBody(formData);
  if (error || !body) return error ?? { status: 'error' };

  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.FEDERATIONS_ADMIN, body);
    const raw = extractRaw(data);
    const federationId = raw ? mapFederation(raw).id : undefined;

    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.CREATE_A_FEDERATION);
    if (federationId) {
      revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));
    }

    return {
      status: 'success',
      federationId,
    } satisfies FederationActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies FederationActionState;
  }
}

```

## `src/_actions/federation/updateFederation.ts`

```
/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type { FederationActionState } from '@/_types/federation';
import { buildUpdateFederationBody } from './payload';

export async function updateFederation(
  _prevState: FederationActionState,
  formData: FormData,
): Promise<FederationActionState> {
  const { body, error, federationId } = buildUpdateFederationBody(formData);
  if (error || !body || !federationId) {
    return error ?? {
      status: 'error',
      error: {
        reason: 'FORM_VALIDATION_ERROR',
        message: 'Missing federation identifier.',
        error: 'Federation identifier is required to update the record.',
      },
    };
  }

  const client = await getServerAxios();

  try {
    await client.patch(API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId), body);
    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));

    return {
      status: 'success',
      federationId,
    } satisfies FederationActionState;
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      status: 'error',
      error: normalized.data,
    } satisfies FederationActionState;
  }
}

```

## `src/_actions/federation/deleteFederation.ts`

```
/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';

export type DeleteFederationResult = Readonly<{
  success: boolean;
  error?: string;
  reason?: string;
}>;

export async function deleteFederation(
  federationId: string,
): Promise<DeleteFederationResult> {
  if (!federationId) {
    return {
      success: false,
      reason: 'FORM_VALIDATION_ERROR',
      error: 'Missing federation identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.FEDERATION_ADMIN_BY_ID(federationId));
    revalidatePath(NAVIGATION.FEDERATIONS);
    revalidatePath(NAVIGATION.FEDERATION_BY_ID(federationId));
    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    return {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
  }
}

```

## `src/app/federations/page.tsx`

```
/** @format */

import Link from 'next/link';

import { getGeoCountries } from '@/_actions/geo/getGeoCountries';
import { getAdminFederations } from '@/_actions/federation/getAdminFederations';
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
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parsePositiveInt(params?.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(params?.page_size, DEFAULT_PAGE_SIZE);
  const sort = (parseString(params?.sort) as FederationSort | undefined) ?? DEFAULT_SORT;
  const status = parseString(params?.status) as FederationStatusFilter | undefined;
  const federationLevel = parseString(
    params?.federation_level,
  ) as FederationLevel | undefined;

  const [federationsResponse, countriesResponse] = await Promise.all([
    getAdminFederations({ page, pageSize, sort, status, federationLevel }),
    getGeoCountries(),
  ]);

  const countryLabels = new Map(
    countriesResponse.data.map(country => [country.id, country.name]),
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
              {federationsResponse.error.error || federationsResponse.error.message}
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
                  <Cell header className='padding-left--16'>Name</Cell>
                  <Cell header className='padding-left--16'>Slug</Cell>
                  <Cell header className='padding-left--16'>Level</Cell>
                  <Cell header className='padding-left--16'>Country</Cell>
                  <Cell header align='center'>Active</Cell>
                  <Cell header className='padding-left--16'>Created</Cell>
                  <Cell header className='padding-left--16'>Updated</Cell>
                </Row>
              </Thead>
              <Tbody>
                {federationsResponse.data.length === 0 ? (
                  <Row>
                    <Cell>No federations found for the current filters.</Cell>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Cell key={index} className='padding-left--16'>
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
                      <Cell>{renderIconPreview(federation.name, federation.iconUrl)}</Cell>
                      <Cell className='padding-left--16'>{federation.name}</Cell>
                      <Cell className='padding-left--16'>{federation.slug}</Cell>
                      <Cell className='padding-left--16'>
                        {federation.federationLevel}
                      </Cell>
                      <Cell className='padding-left--16'>
                        {federation.countryId
                          ? countryLabels.get(federation.countryId) ??
                            federation.countryId
                          : PLACEHOLDER}
                      </Cell>
                      <Cell align='center'>
                        {federation.isActive ? 'Yes' : 'No'}
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

```

## `src/app/federations/[id]/page.tsx`

```
/** @format */

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { getGeoCountries } from '@/_actions/geo/getGeoCountries';
import { getAdminFederationById } from '@/_actions/federation/getAdminFederationById';
import Button from '@/_components/forms/Button';
import Box from '@/_components/layout/Box';
import Grid from '@/_components/layout/Grid';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';

import DeleteFederationButton from '../_components/DeleteFederationButton';
import FederationForm from '../_components/FederationForm';

type FederationPageParams = Readonly<{
  id?: string;
}>;

type FederationDetailsPageProps = Readonly<{
  params?: Promise<FederationPageParams> | FederationPageParams;
}>;

function renderUnavailable(title: string, message: string) {
  return (
    <Main>
      <Grid gap={16}>
        <Title size='large'>{title}</Title>
        <Text size='small' color='gray'>
          {message}
        </Text>
        <Button href={NAVIGATION.FEDERATIONS}>Back to federations</Button>
      </Grid>
    </Main>
  );
}

export default async function FederationDetailsPage({
  params,
}: FederationDetailsPageProps = {}) {
  const resolvedParams = await Promise.resolve(params);
  const federationId = resolvedParams?.id;

  if (!federationId) {
    return renderUnavailable(
      'Federation unavailable',
      'Missing federation identifier in the URL.',
    );
  }

  const federationResponse = await getAdminFederationById(federationId);
  if (!federationResponse.data) {
    if (federationResponse.error?.reason === 'FEDERATION_NOT_FOUND') {
      return renderUnavailable(
        'Federation unavailable',
        'We could not find this federation.',
      );
    }

    return renderUnavailable(
      'Federation unavailable',
      federationResponse.error?.error ||
        federationResponse.error?.message ||
        'We could not load this federation.',
    );
  }

  const federation = federationResponse.data;
  const countriesResponse = await getGeoCountries();
  const selectedCountry = countriesResponse.data.find(
    country => country.id === federation.countryId,
  );
  const citiesResponse = federation.countryId
    ? await getGeoCitiesByCountry(federation.countryId)
    : { data: [], error: undefined };
  const selectedCity = citiesResponse.data.find(city => city.id === federation.cityId);

  return (
    <Grid gap={24}>
      <SectionHeader title={`${SECTIONS.FEDERATIONS} / ${federation.name}`} icon='admin'>
        <Box display='flex' gap={4} alignItems='center'>
          <DeleteFederationButton
            federationId={federation.id}
            federationName={federation.name}
          />
          <Button href={NAVIGATION.FEDERATIONS}>All federations</Button>
        </Box>
      </SectionHeader>

      <FederationForm
        federation={federation}
        countries={countriesResponse.data}
        countriesError={countriesResponse.error?.error}
        initialCities={citiesResponse.data}
        selectedCountryLabel={selectedCountry?.name ?? federation.countryId}
        selectedCityLabel={selectedCity?.name ?? federation.cityId}
        edit
      />
    </Grid>
  );
}

```

## `src/app/federations/_components/FederationForm.tsx`

```
/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getGeoCitiesByCountry } from '@/_actions/geo/getGeoCitiesByCountry';
import { createFederation } from '@/_actions/federation/createFederation';
import { updateFederation } from '@/_actions/federation/updateFederation';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import type { City } from '@/_types/city';
import type { Country } from '@/_types/country';
import type { Federation, FederationActionState } from '@/_types/federation';

const INITIAL_STATE: FederationActionState = { status: 'idle' };

const FEDERATION_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  FEDERATION_NOT_FOUND: 'This federation could not be found.',
  FEDERATION_NAME_REQUIRED: 'Federation name is required.',
  FEDERATION_NAME_TOO_LONG: 'Federation name is too long.',
  FEDERATION_NAME_ALREADY_EXISTS: 'A federation with this name already exists.',
  FEDERATION_NATIVE_NAME_TOO_LONG: 'Native name is too long.',
  FEDERATION_SHORT_NAME_TOO_LONG: 'Short name is too long.',
  FEDERATION_ACRONYM_TOO_LONG: 'Acronym is too long.',
  FEDERATION_INVALID_LEVEL: 'Select a valid federation level.',
  FEDERATION_INVALID_COUNTRY_ID: 'Select a valid country.',
  FEDERATION_INVALID_CITY_ID: 'Select a valid city.',
  FEDERATION_CITY_REQUIRES_COUNTRY: 'Select a country before selecting a city.',
  FEDERATION_FOUNDATION_DATE_IN_FUTURE:
    'Foundation date cannot be in the future.',
  FEDERATION_INVALID_OFFICIAL_WEBSITE: 'Enter a valid official website URL.',
  FEDERATION_INVALID_ICON_URL: 'Enter a valid icon URL.',
  FEDERATION_INVALID_HERO_IMAGE_URL: 'Enter a valid hero image URL.',
  FEDERATION_HAS_RELATIONS:
    'This federation cannot be deleted because it is linked to other records.',
};

type FederationFormProps = Readonly<{
  federation?: Federation | null;
  countries: ReadonlyArray<Pick<Country, 'id' | 'name'>>;
  initialCities?: ReadonlyArray<Pick<City, 'id' | 'name'>>;
  countriesError?: string | null;
  selectedCountryLabel?: string | null;
  selectedCityLabel?: string | null;
  edit?: boolean;
}>;

type SelectorOption = Readonly<{
  id: string;
  name: string;
}>;

function formatDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '--';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleString();
}

function resolveErrorMessage(error?: FederationActionState['error']): string {
  if (!error) return 'Unexpected error.';

  return (
    FEDERATION_ERROR_MESSAGES[error.reason] ??
    error.error ??
    error.message ??
    'Unexpected error.'
  );
}

function resolveGeoErrorMessage(message?: string): string {
  return message || 'We could not load cities for the selected country.';
}

export default function FederationForm({
  federation,
  countries,
  initialCities = [],
  countriesError = null,
  selectedCountryLabel = null,
  selectedCityLabel = null,
  edit = false,
}: FederationFormProps) {
  const router = useRouter();
  const latestCitiesRequest = useRef(0);

  const [selectedCountryId, setSelectedCountryId] = useState(
    federation?.countryId ?? '',
  );
  const [selectedCityId, setSelectedCityId] = useState(federation?.cityId ?? '');
  const [cityOptions, setCityOptions] = useState<ReadonlyArray<SelectorOption>>(
    initialCities.map(city => ({ id: city.id, name: city.name })),
  );
  const [isCitiesPending, setIsCitiesPending] = useState(false);
  const [citiesError, setCitiesError] = useState('');

  const [editState, editAction, editPending] = useActionState<
    FederationActionState,
    FormData
  >(updateFederation, INITIAL_STATE);
  const [createState, createAction, createPending] = useActionState<
    FederationActionState,
    FormData
  >(createFederation, INITIAL_STATE);

  const actionState = edit ? editState : createState;
  const formAction = edit ? editAction : createAction;
  const isPending = edit ? editPending : createPending;

  const countryOptions = useMemo(() => {
    if (
      !selectedCountryId ||
      countries.some(country => country.id === selectedCountryId)
    ) {
      return countries;
    }

    return [
      {
        id: selectedCountryId,
        name: selectedCountryLabel ?? selectedCountryId,
      },
      ...countries,
    ];
  }, [countries, selectedCountryId, selectedCountryLabel]);

  const mergedCityOptions = useMemo(() => {
    if (!selectedCityId || cityOptions.some(city => city.id === selectedCityId)) {
      return cityOptions;
    }

    return [
      {
        id: selectedCityId,
        name: selectedCityLabel ?? selectedCityId,
      },
      ...cityOptions,
    ];
  }, [cityOptions, selectedCityId, selectedCityLabel]);

  const loadCitiesForCountry = useCallback(async (countryId: string) => {
    const requestId = latestCitiesRequest.current + 1;
    latestCitiesRequest.current = requestId;

    if (!countryId) {
      setCityOptions([]);
      setCitiesError('');
      setIsCitiesPending(false);
      return;
    }

    setIsCitiesPending(true);
    setCitiesError('');

    const response = await getGeoCitiesByCountry(countryId);
    if (latestCitiesRequest.current !== requestId) return;

    if (response.error) {
      setCityOptions([]);
      setCitiesError(resolveGeoErrorMessage(response.error.error));
      setIsCitiesPending(false);
      return;
    }

    setCityOptions(response.data.map(city => ({ id: city.id, name: city.name })));
    setCitiesError('');
    setIsCitiesPending(false);
  }, []);

  useEffect(() => {
    if (actionState.status === 'idle') return;

    if (actionState.status === 'error') {
      toast.error(resolveErrorMessage(actionState.error));
      return;
    }

    if (edit) {
      toast.success('Federation updated successfully.');
      router.refresh();
      return;
    }

    toast.success('Federation created successfully.');
    if (actionState.federationId) {
      router.push(NAVIGATION.FEDERATION_BY_ID(actionState.federationId));
      router.refresh();
      return;
    }

    router.push(NAVIGATION.FEDERATIONS);
    router.refresh();
  }, [actionState.error, actionState.federationId, actionState.status, edit, router]);

  const handleCancel = useCallback(() => {
    if (globalThis.window?.history.length && globalThis.window.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.FEDERATIONS);
  }, [router]);

  const handleCountryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextCountryId = event.target.value;
      setSelectedCountryId(nextCountryId);
      setSelectedCityId('');
      setCityOptions([]);
      setCitiesError('');
      void loadCitiesForCountry(nextCountryId);
    },
    [loadCitiesForCountry],
  );

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCityId(event.target.value);
    },
    [],
  );

  const cityHelperText = !selectedCountryId
    ? 'Select a country to enable cities.'
    : isCitiesPending
      ? 'Loading cities...'
      : citiesError
        ? citiesError
        : mergedCityOptions.length === 0
          ? 'No cities available for the selected country.'
          : undefined;

  const countryHelperText = countriesError
    ? countriesError
    : countryOptions.length === 0
      ? 'Countries are currently unavailable.'
      : undefined;

  return (
    <Form action={formAction}>
      {edit && federation ? (
        <input type='hidden' name='federationId' value={federation.id} />
      ) : null}

      <Section>
        <Grid gap={8} columns={2}>
          <TextInput
            label='Federation name'
            name='name'
            placeholder='e.g. Royal Spanish Football Federation'
            defaultValue={federation?.name ?? ''}
            required
            disabled={isPending}
          />
          <Select
            label='Federation level'
            name='federationLevel'
            defaultValue={federation?.federationLevel ?? 'NATIONAL'}
            disabled={isPending}
            required
          >
            <option value='WORLD'>World</option>
            <option value='CONTINENTAL'>Continental</option>
            <option value='NATIONAL'>National</option>
          </Select>
          <TextInput
            label='Native name'
            name='nativeName'
            placeholder='Optional native name'
            defaultValue={federation?.nativeName ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Short name'
            name='shortName'
            placeholder='Optional short name'
            defaultValue={federation?.shortName ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Acronym'
            name='acronym'
            placeholder='Optional acronym'
            defaultValue={federation?.acronym ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Foundation date'
            name='foundationDate'
            type='date'
            defaultValue={formatDateForInput(federation?.foundationDate)}
            disabled={isPending}
          />
          <Select
            label='Country'
            name='countryId'
            value={selectedCountryId}
            onChange={handleCountryChange}
            disabled={isPending || Boolean(countriesError)}
            helperText={countryHelperText}
            error={Boolean(countriesError)}
          >
            <option value=''>No country</option>
            {countryOptions.map(country => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>
          <Select
            label='City'
            name='cityId'
            value={selectedCityId}
            onChange={handleCityChange}
            disabled={isPending || !selectedCountryId || isCitiesPending}
            helperText={cityHelperText}
            error={Boolean(citiesError)}
          >
            <option value=''>No city</option>
            {mergedCityOptions.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
          <TextInput
            label='Official website URL'
            name='officialWebsiteUrl'
            type='url'
            placeholder='https://...'
            defaultValue={federation?.officialWebsiteUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Icon URL'
            name='iconUrl'
            type='url'
            placeholder='https://...'
            defaultValue={federation?.iconUrl ?? ''}
            disabled={isPending}
          />
          <TextInput
            label='Hero image URL'
            name='heroImageUrl'
            type='url'
            placeholder='https://...'
            defaultValue={federation?.heroImageUrl ?? ''}
            disabled={isPending}
          />
          <CheckBoxInput
            label='Active'
            name='isActive'
            value='true'
            defaultChecked={federation?.isActive ?? true}
            disabled={isPending}
          />
          <TextArea
            label='Description'
            name='description'
            placeholder='Optional description'
            defaultValue={federation?.description ?? ''}
            disabled={isPending}
            rows={6}
            className='grid-column--2'
          />
        </Grid>

        {edit && federation ? (
          <Grid gap={8} columns={2} className='margin-top--16'>
            <TextInput label='ID' defaultValue={federation.id} readOnly disabled />
            <TextInput label='Slug' defaultValue={federation.slug} readOnly disabled />
            <TextInput
              label='Created at'
              defaultValue={formatDateTime(federation.createdAt)}
              readOnly
              disabled
            />
            <TextInput
              label='Updated at'
              defaultValue={formatDateTime(federation.updatedAt)}
              readOnly
              disabled
            />
          </Grid>
        ) : null}

        <ButtonGroup gap={4} className='margin-top--24'>
          <Button type='submit' disabled={isPending} aria-busy={isPending}>
            {isPending
              ? edit
                ? 'Updating federation...'
                : 'Creating federation...'
              : edit
                ? 'Update federation'
                : 'Create federation'}
          </Button>
          <Button
            type='button'
            onClick={handleCancel}
            disabled={isPending}
            variant='borderless'
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Section>
    </Form>
  );
}

```

## `src/app/federations/_components/FederationFilters.tsx`

```
/** @format */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import NAVIGATION from '@/_constants/navigation';
import type {
  FederationLevel,
  FederationSort,
  FederationStatusFilter,
} from '@/_types/federation';

type FederationFiltersProps = Readonly<{
  pageSize: number;
  sort: FederationSort;
  status?: FederationStatusFilter;
  federationLevel?: FederationLevel;
}>;

const FILTERS_TOAST_ID = 'federations-filters-loading';

export default function FederationFilters({
  pageSize,
  sort,
  status,
  federationLevel,
}: FederationFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasPendingNavigationRef = useRef(false);

  useEffect(() => {
    if (!hasPendingNavigationRef.current) return;

    hasPendingNavigationRef.current = false;
    toast.dismiss(FILTERS_TOAST_ID);
  }, [federationLevel, pageSize, sort, status]);

  const handleChange = useCallback(() => {
    hasPendingNavigationRef.current = true;
    toast.loading('Updating filters...', { id: FILTERS_TOAST_ID });
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} method='GET' action={NAVIGATION.FEDERATIONS}>
      <Grid gap={8} columns={4} alignItems='end'>
        <input type='hidden' name='page' value='1' />
        <input type='hidden' name='page_size' value={String(pageSize)} />
        <Select
          label='Sort'
          name='sort'
          defaultValue={sort}
          onChange={handleChange}
        >
          <option value='updated_at_desc'>Updated ↓</option>
          <option value='updated_at_asc'>Updated ↑</option>
          <option value='created_at_desc'>Created ↓</option>
          <option value='created_at_asc'>Created ↑</option>
          <option value='name_asc'>Name A-Z</option>
          <option value='name_desc'>Name Z-A</option>
          <option value='is_active_desc'>Active first</option>
          <option value='is_active_asc'>Inactive first</option>
        </Select>
        <Select
          label='Status'
          name='status'
          defaultValue={status ?? 'all'}
          onChange={handleChange}
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </Select>
        <Select
          label='Level'
          name='federation_level'
          defaultValue={federationLevel ?? ''}
          onChange={handleChange}
        >
          <option value=''>All levels</option>
          <option value='WORLD'>World</option>
          <option value='CONTINENTAL'>Continental</option>
          <option value='NATIONAL'>National</option>
        </Select>
        <Grid display='flex' gap={8} alignItems='center'>
          <Button href={NAVIGATION.FEDERATIONS} variant='borderless'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

```

## `src/app/federations/_components/DeleteFederationButton.tsx`

```
/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteFederation } from '@/_actions/federation/deleteFederation';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';

const DELETE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  FEDERATION_HAS_RELATIONS:
    'This federation cannot be deleted because it is still linked to other records.',
  FEDERATION_NOT_FOUND: 'This federation no longer exists.',
};

type DeleteFederationButtonProps = Readonly<{
  federationId: string;
  federationName: string;
}>;

export default function DeleteFederationButton({
  federationId,
  federationName,
}: DeleteFederationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${federationName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteFederation(federationId);

      if (result.success) {
        toast.success(`"${federationName}" deleted.`);
        router.push(NAVIGATION.FEDERATIONS);
        router.refresh();
        return;
      }

      toast.error(
        (result.reason && DELETE_ERROR_MESSAGES[result.reason]) ||
          result.error ||
          'We could not delete this federation.',
      );
    });
  }, [federationId, federationName, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete federation'}
    </Button>
  );
}

```

