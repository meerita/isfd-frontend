/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CompetitionListResponse,
  CompetitionSort,
  CompetitionVisibilityFilter,
} from '@/_types/competition';
import { mapCompetitionListItem, mapCompetitionMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CompetitionSort;
  visibility?: CompetitionVisibilityFilter;
  competitionTypeId?: string;
  federationId?: string;
  countryId?: string;
}): CompetitionListResponse {
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

export async function getAdminCompetitions(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CompetitionSort;
    visibility?: CompetitionVisibilityFilter;
    competitionTypeId?: string;
    federationId?: string;
    countryId?: string;
  }> = {},
): Promise<CompetitionListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    visibility,
    competitionTypeId,
    federationId,
    countryId,
  } = query;
  const filters = {
    sort,
    visibility,
    competitionTypeId,
    federationId,
    countryId,
  };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (visibility) params.visibility = visibility;
  if (competitionTypeId) params.competition_type_id = competitionTypeId;
  if (federationId) params.federation_id = federationId;
  if (countryId) params.country_id = countryId;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COMPETITIONS_ADMIN, {
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
          message: 'Invalid competitions response.',
          error: 'The competitions list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCompetitionListItem),
      metadata: raw.metadata
        ? mapCompetitionMetadata(raw.metadata)
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
