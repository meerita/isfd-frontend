/** @format */

import API_ROUTES from '@/_constants/apiRoutes';
import ENV from '@/_constants/env';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import api from '@/_lib/axiosInstance';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  ApiErrorResponse,
} from '@/_types/api';
import type {
  CreateStadiumRequest,
  StadiumAdminDetailResponse,
  StadiumAdminListResponse,
  StadiumAdminSort,
  StadiumPublicDetailResponse,
  StadiumPublicListResponse,
  StadiumPublicSort,
  StadiumStatusFilter,
  UpdateStadiumRequest,
  UploadStadiumImagesResponse,
} from '@/_types/stadium';
import {
  extractDataRecord,
  extractListPayload,
  mapAdminStadium,
  mapAdminStadiumListItem,
  mapAdminStadiumMetadata,
  mapPublicStadium,
  mapPublicStadiumListItem,
  mapPublicStadiumMetadata,
} from './mappers';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function invalidResponse(reason: string, message: string): ApiErrorResponse {
  return {
    reason,
    message,
    error: message,
  };
}

function extractUploadImagesPayload(
  payload: unknown,
): UploadStadiumImagesResponse | null {
  if (
    payload &&
    typeof payload === 'object' &&
    typeof (payload as UploadStadiumImagesResponse).stadium_id === 'string' &&
    Array.isArray((payload as UploadStadiumImagesResponse).images)
  ) {
    return payload as UploadStadiumImagesResponse;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    typeof (payload.data as UploadStadiumImagesResponse).stadium_id === 'string' &&
    Array.isArray((payload.data as UploadStadiumImagesResponse).images)
  ) {
    return payload.data as UploadStadiumImagesResponse;
  }

  return null;
}

async function parseFetchApiError(response: Response): Promise<ApiErrorResponse> {
  try {
    const payload = (await response.json()) as {
      code?: string;
      reason?: string;
      message?: string;
      error?: string;
      details?: string;
    };

    return {
      reason: payload.reason ?? payload.code ?? 'API_ERROR',
      message: payload.message ?? payload.error ?? 'Unexpected error',
      error:
        payload.error ?? payload.details ?? payload.message ?? 'Unexpected error',
      statusCode: response.status,
    };
  } catch {
    return {
      reason: 'API_ERROR',
      message: response.statusText || 'Unexpected error',
      error: response.statusText || 'Unexpected error',
      statusCode: response.status,
    };
  }
}

function buildParams(
  entries: ReadonlyArray<readonly [string, string | number | undefined | null]>,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value;
  }

  return params;
}

export async function getPublicStadiumBySlug(
  slug: string,
): Promise<StadiumPublicDetailResponse> {
  if (!slug) {
    return {
      data: null,
      error: invalidResponse('STADIUM_SLUG_REQUIRED', 'Stadium slug is required.'),
    };
  }

  try {
    const { data } = await api.get<unknown>(API_ROUTES.STADIUM_BY_SLUG(slug));
    const raw = extractDataRecord(data);

    if (!raw) {
      return {
        data: null,
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The public stadium response was not valid.',
        ),
      };
    }

    return { data: mapPublicStadium(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return { data: null, error: normalized.data };
  }
}

export async function listPublicStadiums(
  query: Readonly<{
    page?: number;
    page_size?: number;
    sort?: StadiumPublicSort;
    country_id?: string;
    city_id?: string;
  }> = {},
): Promise<StadiumPublicListResponse> {
  const params = buildParams([
    ['page', query.page ?? DEFAULT_PAGE],
    ['page_size', query.page_size ?? DEFAULT_PAGE_SIZE],
    ['sort', query.sort],
    ['country_id', query.country_id],
    ['city_id', query.city_id],
  ]);

  try {
    const { data } = await api.get<unknown>(API_ROUTES.STADIUMS, { params });
    const payload = extractListPayload(data);

    if (!payload) {
      return {
        data: [],
        metadata: {
          page: DEFAULT_PAGE,
          page_size: DEFAULT_PAGE_SIZE,
          total_items: 0,
          total_pages: 0,
          has_next_page: false,
          has_previous_page: false,
        },
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The public stadium list response was not valid.',
        ),
      };
    }

    return {
      data: payload.data.map(mapPublicStadiumListItem),
      metadata: payload.metadata
        ? mapPublicStadiumMetadata(payload.metadata)
        : {
            page: DEFAULT_PAGE,
            page_size: DEFAULT_PAGE_SIZE,
            total_items: 0,
            total_pages: 0,
            has_next_page: false,
            has_previous_page: false,
          },
    };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      data: [],
      metadata: {
        page: DEFAULT_PAGE,
        page_size: DEFAULT_PAGE_SIZE,
        total_items: 0,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
      },
      error: normalized.data,
    };
  }
}

export async function getAdminStadiumById(
  stadiumId: string,
): Promise<StadiumAdminDetailResponse> {
  if (!stadiumId) {
    return {
      data: null,
      error: invalidResponse('STADIUM_ID_REQUIRED', 'Stadium identifier is required.'),
    };
  }

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId),
    );
    const raw = extractDataRecord(data);

    if (!raw) {
      return {
        data: null,
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The stadium detail response was not valid.',
        ),
      };
    }

    return { data: mapAdminStadium(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return { data: null, error: normalized.data };
  }
}

export async function listAdminStadiums(
  query: Readonly<{
    page?: number;
    page_size?: number;
    sort?: StadiumAdminSort;
    status?: StadiumStatusFilter;
    country_id?: string;
    city_id?: string;
    primary_club_id?: string;
  }> = {},
): Promise<StadiumAdminListResponse> {
  const params = buildParams([
    ['page', query.page ?? DEFAULT_PAGE],
    ['page_size', query.page_size ?? DEFAULT_PAGE_SIZE],
    ['sort', query.sort],
    ['status', query.status],
    ['country_id', query.country_id],
    ['city_id', query.city_id],
    ['primary_club_id', query.primary_club_id],
  ]);

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(API_ROUTES.STADIUMS_ADMIN, {
      params,
    });
    const payload = extractListPayload(data);

    if (!payload) {
      return {
        data: [],
        metadata: {
          page: DEFAULT_PAGE,
          page_size: DEFAULT_PAGE_SIZE,
          total_items: 0,
          total_pages: 0,
          has_next_page: false,
          has_previous_page: false,
          filters: {
            sort: query.sort ?? 'updated_at_desc',
            status: query.status ?? 'all',
            country_id: query.country_id ?? null,
            city_id: query.city_id ?? null,
            primary_club_id: query.primary_club_id ?? null,
          },
        },
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The stadium list response was not valid.',
        ),
      };
    }

    return {
      data: payload.data.map(mapAdminStadiumListItem),
      metadata: payload.metadata
        ? mapAdminStadiumMetadata(payload.metadata)
        : {
            page: DEFAULT_PAGE,
            page_size: DEFAULT_PAGE_SIZE,
            total_items: 0,
            total_pages: 0,
            has_next_page: false,
            has_previous_page: false,
            filters: {
              sort: query.sort ?? 'updated_at_desc',
              status: query.status ?? 'all',
              country_id: query.country_id ?? null,
              city_id: query.city_id ?? null,
              primary_club_id: query.primary_club_id ?? null,
            },
          },
    };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);

    return {
      data: [],
      metadata: {
        page: DEFAULT_PAGE,
        page_size: DEFAULT_PAGE_SIZE,
        total_items: 0,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
        filters: {
          sort: query.sort ?? 'updated_at_desc',
          status: query.status ?? 'all',
          country_id: query.country_id ?? null,
          city_id: query.city_id ?? null,
          primary_club_id: query.primary_club_id ?? null,
        },
      },
      error: normalized.data,
    };
  }
}

export async function createAdminStadium(
  payload: CreateStadiumRequest,
): Promise<StadiumAdminDetailResponse> {
  const client = await getServerAxios();

  try {
    const { data } = await client.post<unknown>(API_ROUTES.STADIUMS_ADMIN, payload);
    const raw = extractDataRecord(data);

    if (!raw) {
      return {
        data: null,
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The create stadium response was not valid.',
        ),
      };
    }

    return { data: mapAdminStadium(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { data: null, error: normalized.data };
  }
}

export async function updateAdminStadium(
  stadiumId: string,
  payload: UpdateStadiumRequest,
): Promise<StadiumAdminDetailResponse> {
  const client = await getServerAxios();

  try {
    const { data } = await client.patch<unknown>(
      API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId),
      payload,
    );
    const raw = extractDataRecord(data);

    if (!raw) {
      return {
        data: null,
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The update stadium response was not valid.',
        ),
      };
    }

    return { data: mapAdminStadium(raw) };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { data: null, error: normalized.data };
  }
}

export async function deleteAdminStadium(stadiumId: string): Promise<{
  success: boolean;
  error?: ApiErrorResponse;
}> {
  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.STADIUM_ADMIN_BY_ID(stadiumId));
    return { success: true };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { success: false, error: normalized.data };
  }
}

export async function uploadAdminStadiumImages(
  stadiumId: string,
  files: ReadonlyArray<File>,
): Promise<{
  data: UploadStadiumImagesResponse | null;
  error?: ApiErrorResponse;
}> {
  if (!stadiumId) {
    return {
      data: null,
      error: invalidResponse('STADIUM_ID_REQUIRED', 'Stadium identifier is required.'),
    };
  }

  if (files.length === 0) {
    return {
      data: null,
      error: invalidResponse(
        'STADIUM_IMAGES_REQUIRED',
        'At least one stadium image is required.',
      ),
    };
  }

  const payload = new FormData();
  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  for (const file of files) {
    payload.append('files', file, file.name);
  }

  try {
    const response = await fetch(
      `${ENV.apiBaseUrl}${API_ROUTES.STADIUM_ADMIN_IMAGES(stadiumId)}`,
      {
        method: 'POST',
        headers,
        body: payload,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return {
        data: null,
        error: await parseFetchApiError(response),
      };
    }

    const data = (await response.json()) as unknown;
    const parsed = extractUploadImagesPayload(data);

    if (!parsed) {
      return {
        data: null,
        error: invalidResponse(
          'INVALID_RESPONSE',
          'The stadium image upload response was not valid.',
        ),
      };
    }

    return { data: parsed };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { data: null, error: normalized.data };
  }
}

export async function deleteAdminStadiumImage(
  stadiumId: string,
  attachmentId: string,
): Promise<{
  success: boolean;
  error?: ApiErrorResponse;
}> {
  const client = await getServerAxios();

  try {
    await client.delete(API_ROUTES.STADIUM_ADMIN_IMAGE_BY_ID(stadiumId, attachmentId));
    return { success: true };
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { success: false, error: normalized.data };
  }
}
