/** @format */

// File: src/_lib/apiError.ts
// Purpose: Normalize and log backend error responses consistently
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { AxiosError } from 'axios';

import type {
  ApiError,
  ApiErrorResponse,
  NormalizedApiError,
  NormalizedBackendApiError,
} from '@/_types/api';

const DEFAULT_ERROR: ApiErrorResponse = {
  reason: 'UNKNOWN_ERROR',
  message: 'Unexpected error',
  error: 'Unexpected error',
};

const DEFAULT_BACKEND_ERROR: ApiError = {
  code: 'UNKNOWN_ERROR',
  message: 'Unexpected error',
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status ?? 500;
    const payload = (error.response?.data ?? {}) as Partial<ApiErrorResponse> & { code?: string; details?: string };

    return {
      statusCode,
      data: {
        reason: payload.reason ?? payload.code ?? 'API_ERROR',
        message: payload.message ?? payload.error ?? DEFAULT_ERROR.message,
        error: payload.error ?? payload.details ?? payload.message ?? DEFAULT_ERROR.error,
        statusCode: payload.statusCode ?? statusCode,
      },
    } satisfies NormalizedApiError;
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      data: {
        reason: 'UNEXPECTED_ERROR',
        message: error.message,
        error: error.message,
      },
    } satisfies NormalizedApiError;
  }

  return {
    statusCode: 500,
    data: DEFAULT_ERROR,
  } satisfies NormalizedApiError;
}

export function logApiError(normalized: NormalizedApiError): void {
  const { statusCode, data } = normalized;

  console.error(
    [
      `Code: ${statusCode}`,
      `Reason: ${data.reason}`,
      `Message: ${data.message}`,
      `Error: ${data.error}`,
    ].join('\n'),
  );
}

export function normalizeBackendApiError(
  error: unknown,
): NormalizedBackendApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status ?? 500;
    const payload = (error.response?.data ?? {}) as Partial<ApiError> & {
      code?: string;
      details?: string;
      reason?: string;
      error?: string;
    };

    return {
      statusCode,
      data: {
        code: payload.code ?? payload.reason ?? 'API_ERROR',
        message:
          payload.message ?? payload.error ?? DEFAULT_BACKEND_ERROR.message,
        details: payload.details ?? payload.error,
      },
    } satisfies NormalizedBackendApiError;
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      data: {
        code: 'UNEXPECTED_ERROR',
        message: error.message,
        details: error.message,
      },
    } satisfies NormalizedBackendApiError;
  }

  return {
    statusCode: 500,
    data: DEFAULT_BACKEND_ERROR,
  } satisfies NormalizedBackendApiError;
}

export function logBackendApiError(normalized: NormalizedBackendApiError): void {
  const { statusCode, data } = normalized;

  console.error(
    [
      `Code: ${statusCode}`,
      `Backend code: ${data.code}`,
      `Message: ${data.message}`,
      `Details: ${data.details ?? ''}`,
    ].join('\n'),
  );
}
