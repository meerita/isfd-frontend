/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CompetitionTypeListResponse,
  CompetitionTypeSort,
  CompetitionTypeStatusFilter,
} from '@/_types/competitionType';
import {
  mapCompetitionTypeListItem,
  mapCompetitionTypeMetadata,
} from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CompetitionTypeSort;
  status?: CompetitionTypeStatusFilter;
  competitionTypeCategory?: string;
  participantScope?: string;
}): CompetitionTypeListResponse {
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

export async function getAdminCompetitionTypes(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CompetitionTypeSort;
    status?: CompetitionTypeStatusFilter;
    competitionTypeCategory?: string;
    participantScope?: string;
  }> = {},
): Promise<CompetitionTypeListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    competitionTypeCategory,
    participantScope,
  } = query;
  const filters = { sort, status, competitionTypeCategory, participantScope };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (competitionTypeCategory) {
    params.competition_type_category = competitionTypeCategory;
  }
  if (participantScope) {
    params.participant_scope = participantScope;
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COMPETITION_TYPES_ADMIN, {
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
          message: 'Invalid competition types response.',
          error: 'The competition types list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCompetitionTypeListItem),
      metadata: raw.metadata
        ? mapCompetitionTypeMetadata(raw.metadata)
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
