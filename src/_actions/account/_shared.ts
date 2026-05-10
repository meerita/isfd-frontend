/** @format */

import { logBackendApiError, normalizeBackendApiError } from '@/_lib/apiError';
import type { MeApiResult } from '@/_types/me';

export function buildMeSuccessResult<T>(data: T): MeApiResult<T> {
  return {
    data,
    statusCode: 200,
  };
}

export function buildMeFailureResult<T>(
  error: unknown,
  options?: Readonly<{
    silentCodes?: ReadonlyArray<string>;
  }>,
): MeApiResult<T> {
  const normalized = normalizeBackendApiError(error);
  const silentCodes = options?.silentCodes ?? [];

  if (!silentCodes.includes(normalized.data.code)) {
    logBackendApiError(normalized);
  }

  return {
    data: null,
    error: normalized.data,
    statusCode: normalized.statusCode,
  };
}
