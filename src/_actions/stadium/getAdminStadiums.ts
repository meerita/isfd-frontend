/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  StadiumListResponse,
  StadiumSort,
  StadiumStatusFilter,
} from '@/_types/stadium';
import { mapStadiumListItem, mapStadiumMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: StadiumSort;
  status?: StadiumStatusFilter;
  countryId?: string;
  cityId?: string;
  primaryClubId?: string;
}): StadiumListResponse {
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

export async function getAdminStadiums(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: StadiumSort;
    status?: StadiumStatusFilter;
    countryId?: string;
    cityId?: string;
    primaryClubId?: string;
  }> = {},
): Promise<StadiumListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    countryId,
    cityId,
    primaryClubId,
  } = query;
  const filters = { sort, status, countryId, cityId, primaryClubId };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (countryId) params.country_id = countryId;
  if (cityId) params.city_id = cityId;
  if (primaryClubId) params.primary_club_id = primaryClubId;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.STADIUMS_ADMIN, {
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
          message: 'Invalid stadiums response.',
          error: 'The stadiums list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapStadiumListItem),
      metadata: raw.metadata
        ? mapStadiumMetadata(raw.metadata)
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
