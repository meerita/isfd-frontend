/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  PersonListResponse,
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';
import { mapPersonListItem, mapPersonMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: PersonSort;
  status?: PersonStatusFilter;
  gender?: string;
  currentProfession?: string;
}): PersonListResponse {
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

export async function getAdminPersons(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: PersonSort;
    status?: PersonStatusFilter;
    gender?: string;
    currentProfession?: string;
  }> = {},
): Promise<PersonListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    gender,
    currentProfession,
  } = query;
  const filters = { sort, status, gender, currentProfession };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (gender) params.gender = gender;
  if (currentProfession) params.current_profession = currentProfession;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.PERSONS_ADMIN, {
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
          message: 'Invalid persons response.',
          error: 'The persons list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapPersonListItem),
      metadata: raw.metadata
        ? mapPersonMetadata(raw.metadata)
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
