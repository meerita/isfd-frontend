/** @format */

'use server';

import {
  parseCompetitionStructureBranchKind,
  parseCompetitionTierScopeKind,
  parseParticipantScope,
  type CompetitionStructureBranchKind,
  type CompetitionTierScopeKind,
} from '@/_constants/enums/competition';
import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  CompetitionStructureSort,
  CompetitionStructureStatusFilter,
  CompetitionTierListResponse,
} from '@/_types/competitionStructure';
import { mapCompetitionTier, mapCompetitionTierMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: CompetitionStructureSort;
  status?: CompetitionStructureStatusFilter;
  competitionPyramidId?: string;
  parentTierId?: string;
  participantScope?: string;
  scopeKind?: CompetitionTierScopeKind;
  branchKind?: CompetitionStructureBranchKind;
  asOfDate?: string;
}): CompetitionTierListResponse {
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
            participantScope:
              parseParticipantScope(filters.participantScope) ?? undefined,
            scopeKind:
              parseCompetitionTierScopeKind(filters.scopeKind) ?? undefined,
            branchKind:
              parseCompetitionStructureBranchKind(filters.branchKind) ??
              undefined,
          }
        : undefined,
    },
  };
}

export async function getAdminCompetitionTiers(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: CompetitionStructureSort;
    status?: CompetitionStructureStatusFilter;
    competitionPyramidId?: string;
    parentTierId?: string;
    participantScope?: string;
    scopeKind?: CompetitionTierScopeKind;
    branchKind?: CompetitionStructureBranchKind;
    asOfDate?: string;
  }> = {},
): Promise<CompetitionTierListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    status,
    competitionPyramidId,
    parentTierId,
    participantScope,
    scopeKind,
    branchKind,
    asOfDate,
  } = query;
  const filters = {
    sort,
    status,
    competitionPyramidId,
    parentTierId,
    participantScope,
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
  if (competitionPyramidId) params.competition_pyramid_id = competitionPyramidId;
  if (parentTierId) params.parent_tier_id = parentTierId;
  if (participantScope) params.participant_scope = participantScope;
  if (scopeKind) params.scope_kind = scopeKind;
  if (branchKind) params.branch_kind = branchKind;
  if (asOfDate) params.as_of_date = asOfDate;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.COMPETITION_TIERS_ADMIN, {
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
          message: 'Invalid competition tiers response.',
          error: 'The competition tiers list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapCompetitionTier),
      metadata: raw.metadata
        ? mapCompetitionTierMetadata(raw.metadata)
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
