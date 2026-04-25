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

export interface NormalizedApiError {
  statusCode: number;
  data: ApiErrorResponse;
}
