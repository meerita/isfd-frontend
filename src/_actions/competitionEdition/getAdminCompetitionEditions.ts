/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CompetitionEditionListResponse,
  CompetitionEditionSort,
  CompetitionEditionStatusFilter,
  CompetitionEditionVisibilityFilter,
} from '@/_types/competitionEdition';
import {
  mapCompetitionEdition,
  mapCompetitionEditionMetadata,
} from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CompetitionEditionSort;
  status?: CompetitionEditionStatusFilter;
  visibility?: CompetitionEditionVisibilityFilter;
  competitionId?: string;
  competitionPyramidId?: string;
  primaryCompetitionTierId?: string;
  year?: number;
  q?: string;
}): CompetitionEditionListResponse {
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

export async function getAdminCompetitionEditions(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CompetitionEditionSort;
    status?: CompetitionEditionStatusFilter;
    visibility?: CompetitionEditionVisibilityFilter;
    competitionId?: string;
    competitionPyramidId?: string;
    primaryCompetitionTierId?: string;
    year?: number;
    q?: string;
  }> = {},
): Promise<CompetitionEditionListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    visibility,
    competitionId,
    competitionPyramidId,
    primaryCompetitionTierId,
    year,
    q,
  } = query;
  const filters = {
    sort,
    status,
    visibility,
    competitionId,
    competitionPyramidId,
    primaryCompetitionTierId,
    year,
    q,
  };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (visibility) params.visibility = visibility;
  if (competitionId) params.competition_id = competitionId;
  if (competitionPyramidId) params.competition_pyramid_id = competitionPyramidId;
  if (primaryCompetitionTierId) {
    params.primary_competition_tier_id = primaryCompetitionTierId;
  }
  if (typeof year === 'number') params.year = year;
  if (q) params.q = q;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.COMPETITION_EDITIONS_ADMIN,
      { params },
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
          message: 'Invalid competition editions response.',
          error: 'The competition editions list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCompetitionEdition),
      metadata: raw.metadata
        ? mapCompetitionEditionMetadata(raw.metadata)
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
