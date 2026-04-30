/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  AdminCitiesResponse,
  AdminCitySort,
  City,
  CityStatusFilter,
} from '@/_types/city';
import { mapCity, mapMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  countryId?: string;
  province?: string;
  sort?: AdminCitySort;
  status?: CityStatusFilter;
}): AdminCitiesResponse {
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

export async function getAdminCities({
  countryId,
  province,
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
  sort,
  status,
}: Readonly<{
  countryId?: string;
  province?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminCitySort;
  status?: CityStatusFilter;
}> = {}): Promise<AdminCitiesResponse> {
  const filters = { countryId, province, sort, status };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (province) params.province = province;
  if (sort) params.sort = sort;
  if (status) params.status = status;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      countryId ? API_ROUTES.ADMIN_COUNTRY_CITIES(countryId) : API_ROUTES.CITIES_ADMIN,
      {
        params: countryId ? params : { ...params },
      },
    );

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return {
        ...buildEmptyResponse(filters),
        error: {
          reason: 'INVALID_RESPONSE',
          message: 'Invalid cities response.',
          error: 'The cities list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCity),
      metadata: raw.metadata
        ? mapMetadata(raw.metadata)
        : buildEmptyResponse(filters).metadata,
    };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);
    return {
      ...buildEmptyResponse(filters),
      error: normalized.data,
    };
  }
}

export async function getAdminCitiesByCountryIdAndProvince(
  countryId: string,
  provinceName: string,
): Promise<ReadonlyArray<City>> {
  if (!countryId.trim() || !provinceName.trim()) return [];

  const response = await getAdminCities({
    countryId,
    province: provinceName,
    page: 1,
    pageSize: 100,
    sort: 'slug_asc',
    status: 'all',
  });

  return response.data;
}

export const getCities = getAdminCities;
