/** @format */

'use server';

import {
  parseCompetitionPyramidBranchKind,
  parseCompetitionPyramidScopeKind,
  type CompetitionPyramidBranchKind,
  type CompetitionPyramidScopeKind,
} from '@/_constants/enums/competition';
import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CompetitionPyramidListResponse,
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
} from '@/_types/competitionStructure';
import {
  mapCompetitionPyramid,
  mapCompetitionPyramidMetadata,
} from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CompetitionStructureSort;
  status?: CompetitionStructureStatusFilter;
  countryId?: string;
  federationId?: string;
  scopeKind?: CompetitionPyramidScopeKind;
  branchKind?: CompetitionPyramidBranchKind;
  asOfDate?: string;
}): CompetitionPyramidListResponse {
  return {
    data: [],
    metadata: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filters: filters
        ? {
            ...filters,
            scopeKind:
              parseCompetitionPyramidScopeKind(filters.scopeKind) ?? undefined,
            branchKind:
              parseCompetitionPyramidBranchKind(filters.branchKind) ?? undefined,
          }
        : undefined,
    },
  };
}

export async function getAdminCompetitionPyramids(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CompetitionStructureSort;
    status?: CompetitionStructureStatusFilter;
    countryId?: string;
    federationId?: string;
    scopeKind?: CompetitionPyramidScopeKind;
    branchKind?: CompetitionPyramidBranchKind;
    asOfDate?: string;
  }> = {},
): Promise<CompetitionPyramidListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    countryId,
    federationId,
    scopeKind,
    branchKind,
    asOfDate,
  } = query;
  const filters = {
    sort,
    status,
    countryId,
    federationId,
    scopeKind,
    branchKind,
    asOfDate,
  };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (status) params.status = status;
  if (countryId) params.country_id = countryId;
  if (federationId) params.federation_id = federationId;
  if (scopeKind) params.scope_kind = scopeKind;
  if (branchKind) params.branch_kind = branchKind;
  if (asOfDate) params.as_of_date = asOfDate;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COMPETITION_PYRAMIDS_ADMIN, {
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
          message: 'Invalid competition pyramids response.',
          error: 'The competition pyramids list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCompetitionPyramid),
      metadata: raw.metadata
        ? mapCompetitionPyramidMetadata(raw.metadata)
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
