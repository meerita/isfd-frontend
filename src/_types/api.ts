/** @format */

// File: src/_types/api.ts
// Purpose: Shared API error contracts
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

export interface ApiErrorResponse {
  reason: string;
  message: string;
  error: string;
  statusCode?: number;
}

export type ApiError = Readonly<{
  code: string;
  message: string;
  details?: string;
}>;

export interface NormalizedApiError {
  statusCode: number;
  data: ApiErrorResponse;
}

export interface NormalizedBackendApiError {
  statusCode: number;
  data: ApiError;
}
