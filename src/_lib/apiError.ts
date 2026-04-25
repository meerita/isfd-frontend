/** @format */

// File: src/_lib/apiError.ts
// Purpose: Normalize and log backend error responses consistently
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { AxiosError } from 'axios';

import type { ApiErrorResponse, NormalizedApiError } from '@/_types/api';

const DEFAULT_ERROR: ApiErrorResponse = {
  reason: 'UNKNOWN_ERROR',
  message: 'Unexpected error',
  error: 'Unexpected error',
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status ?? 500;
    const payload = (error.response?.data ?? {}) as Partial<ApiErrorResponse>;

    return {
      statusCode,
      data: {
        reason: payload.reason ?? 'API_ERROR',
        message: payload.message ?? payload.error ?? DEFAULT_ERROR.message,
        error: payload.error ?? DEFAULT_ERROR.error,
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
