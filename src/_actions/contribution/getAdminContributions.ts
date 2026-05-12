/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  ContributionAdminListResponse,
  ContributionAdminReviewStatusFilter,
  ContributionAdminSort,
  ContributionAdminTargetEntityTypeFilter,
} from '@/_types/contribution';
import { mapContribution, mapContributionMetadata } from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function buildEmptyResponse(filters?: {
  sort?: ContributionAdminSort;
  reviewStatus?: ContributionAdminReviewStatusFilter;
  targetEntityType?: ContributionAdminTargetEntityTypeFilter;
}): ContributionAdminListResponse {
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

export async function getAdminContributions(
  query: Readonly<{
    page?: number;
    pageSize?: number;
    sort?: ContributionAdminSort;
    reviewStatus?: ContributionAdminReviewStatusFilter;
    targetEntityType?: ContributionAdminTargetEntityTypeFilter;
  }> = {},
): Promise<ContributionAdminListResponse> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sort,
    reviewStatus,
    targetEntityType,
  } = query;
  const filters = { sort, reviewStatus, targetEntityType };
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (sort) params.sort = sort;
  if (reviewStatus) params.review_status = reviewStatus;
  if (targetEntityType) params.target_entity_type = targetEntityType;

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.CONTRIBUTIONS_ADMIN, {
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
          message: 'Invalid contributions response.',
          error: 'The contributions list response was not valid.',
        },
      };
    }

    const raw = data as {
      data: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
    };

    return {
      data: raw.data.map(mapContribution),
      metadata: raw.metadata
        ? mapContributionMetadata(raw.metadata)
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
