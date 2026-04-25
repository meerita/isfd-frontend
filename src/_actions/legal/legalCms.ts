/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import { LEGAL_DOCUMENT_TYPES } from '@/_constants/legal';
import NAVIGATION from '@/_constants/navigation';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import type {
  CreateLegalTranslationPayload,
  CreateLegalDocumentPayload,
  LegalDocument,
  LegalDocumentType,
  LegalListResponse,
  UpdateLegalDocumentPayload,
  UpdateLegalTranslationPayload,
} from '@/_types/legal';

type ListLegalDocumentsFilters = Readonly<{
  page?: number;
  limit?: number;
  type?: LegalDocumentType | '';
  version?: number;
}>;

function getPublicRouteByType(type: LegalDocumentType): string {
  return (
    LEGAL_DOCUMENT_TYPES.find(function findType(option) {
      return option.value === type;
    })?.publicPath ?? API_ROUTES.LEGAL_TERMS
  );
}

function revalidateLegalPaths(documentId?: string, translationId?: string): void {
  revalidatePath(NAVIGATION.LEGAL);
  revalidatePath(NAVIGATION.LEGAL_CREATE);

  if (documentId) {
    revalidatePath(NAVIGATION.LEGAL_BY_ID(documentId));

    if (translationId) {
      revalidatePath(NAVIGATION.LEGAL_TRANSLATION_BY_ID(documentId, translationId));
    }
  }
}

async function getAdminHeaders(): Promise<Record<string, string> | undefined> {
  return getAuthenticatedRequestHeaders({ refreshIfNeeded: true });
}

export async function listLegalDocuments(
  filters: ListLegalDocumentsFilters = {},
): Promise<LegalListResponse> {
  const headers = await getAdminHeaders();

  try {
    const { data } = await api.get<LegalListResponse>(API_ROUTES.LEGAL, {
      headers,
      params: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        ...(filters.type ? { type: filters.type } : {}),
        ...(typeof filters.version === 'number'
          ? { version: filters.version }
          : {}),
      },
    });

    return data;
  } catch (error) {
    logApiError(normalizeApiError(error));
    return {
      data: [],
      pagination: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        total_items: 0,
        total_pages: 1,
      },
    };
  }
}

export async function getLegalDocumentById(
  id: string,
): Promise<LegalDocument | null> {
  const headers = await getAdminHeaders();

  try {
    const { data } = await api.get<LegalDocument>(API_ROUTES.LEGAL_BY_ID(id), {
      headers,
    });

    return data;
  } catch (error) {
    const normalized = normalizeApiError(error);

    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return null;
  }
}

export async function getLatestPublicLegalDocument(
  type: LegalDocumentType,
  language = 'EN',
): Promise<LegalDocument | null> {
  try {
    const { data } = await api.get<LegalDocument>(getPublicRouteByType(type), {
      params: { language },
    });

    return data;
  } catch (error) {
    const normalized = normalizeApiError(error);

    if (normalized.statusCode !== 404) {
      logApiError(normalized);
    }

    return null;
  }
}

export async function createLegalDocument(
  payload: CreateLegalDocumentPayload,
): Promise<LegalDocument> {
  const headers = await getAdminHeaders();

  try {
    const { data } = await api.post<LegalDocument>(API_ROUTES.LEGAL, payload, {
      headers,
    });

    revalidateLegalPaths(data.id);

    return data;
  } catch (error) {
    logApiError(normalizeApiError(error));
    throw error;
  }
}

export async function updateLegalDocument(
  id: string,
  payload: UpdateLegalDocumentPayload,
): Promise<LegalDocument> {
  const headers = await getAdminHeaders();

  try {
    const { data } = await api.patch<LegalDocument>(
      API_ROUTES.LEGAL_BY_ID(id),
      payload,
      {
        headers,
      },
    );

    revalidateLegalPaths(id);

    return data;
  } catch (error) {
    logApiError(normalizeApiError(error));
    throw error;
  }
}

function buildTranslationPayloads(document: LegalDocument) {
  return document.translations.map(function mapTranslation(translation) {
    return {
      id: translation.id,
      language: translation.language,
      content: translation.content,
    };
  });
}

export async function createLegalTranslation(
  documentId: string,
  payload: CreateLegalTranslationPayload,
): Promise<LegalDocument> {
  const document = await getLegalDocumentById(documentId);

  if (!document) {
    throw new Error('Legal document not found.');
  }

  return updateLegalDocument(documentId, {
    translations: [
      ...buildTranslationPayloads(document),
      {
        language: payload.language,
        content: payload.content ?? '',
      },
    ],
  });
}

export async function updateLegalTranslation(
  documentId: string,
  translationId: string,
  payload: UpdateLegalTranslationPayload,
): Promise<LegalDocument['translations'][number]> {
  const headers = await getAdminHeaders();

  try {
    const { data } = await api.patch<LegalDocument['translations'][number]>(
      API_ROUTES.LEGAL_TRANSLATION_BY_ID(documentId, translationId),
      payload,
      {
        headers,
      },
    );

    revalidateLegalPaths(documentId, translationId);

    return data;
  } catch (error) {
    logApiError(normalizeApiError(error));
    throw error;
  }
}

export async function deleteLegalTranslation(
  documentId: string,
  translationId: string,
): Promise<LegalDocument> {
  const document = await getLegalDocumentById(documentId);

  if (!document) {
    throw new Error('Legal document not found.');
  }

  const translation = document.translations.find(function findTranslation(item) {
    return item.id === translationId;
  });

  if (!translation) {
    throw new Error('Legal translation not found.');
  }

  if (translation.status !== 'DRAFT') {
    throw new Error('Only draft translations can be deleted.');
  }

  return updateLegalDocument(documentId, {
    translations: buildTranslationPayloads(document).filter(
      function filterTranslation(item) {
        return item.id !== translationId;
      },
    ),
  });
}

export async function publishLegalDocument(id: string): Promise<LegalDocument> {
  return updateLegalDocument(id, {
    status: 'PUBLISHED',
  });
}

export async function deleteLegalDocument(id: string): Promise<void> {
  const headers = await getAdminHeaders();

  try {
    await api.delete(API_ROUTES.LEGAL_BY_ID(id), {
      headers,
    });

    revalidateLegalPaths(id);
  } catch (error) {
    logApiError(normalizeApiError(error));
    throw error;
  }
}
