/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  SeasonListResponse,
  SeasonSort,
  SeasonStatusFilter,
} from '@/_types/season';
import { mapSeasonListItem, mapSeasonMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: SeasonSort;
  status?: SeasonStatusFilter;
  year?: number;
}): SeasonListResponse {
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

export async function getAdminSeasons(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: SeasonSort;
    status?: SeasonStatusFilter;
    year?: number;
  }> = {},
): Promise<SeasonListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    year,
  } = query;
  const filters = { sort, status, year };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (typeof year === 'number') params.year = year;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.SEASONS_ADMIN, {
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
          message: 'Invalid seasons response.',
          error: 'The seasons list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapSeasonListItem),
      metadata: raw.metadata
        ? mapSeasonMetadata(raw.metadata)
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
