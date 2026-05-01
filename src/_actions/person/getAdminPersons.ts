/** @format */

'use server';

import type {
  PersonCurrentProfession,
  PersonGender,
} from '@/_constants/enums/person';
import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  PersonAdminListResponse,
  PersonSort,
  PersonStatusFilter,
} from '@/_types/person';
import { mapPersonAdminListItem, mapPersonMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: PersonSort;
  status?: PersonStatusFilter;
  gender?: PersonGender;
  current_profession?: PersonCurrentProfession;
}): PersonAdminListResponse {
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
    gender?: PersonGender;
    current_profession?: PersonCurrentProfession;
  }> = {},
): Promise<PersonAdminListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    gender,
    current_profession,
  } = query;
  const filters = { sort, status, gender, current_profession };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (gender) params.gender = gender;
  if (current_profession) params.current_profession = current_profession;

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
      data: raw.data.map(mapPersonAdminListItem),
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
