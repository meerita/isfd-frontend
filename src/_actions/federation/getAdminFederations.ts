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
