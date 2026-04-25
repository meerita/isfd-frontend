/** @format */

// File: src/_types/sport.ts
// Purpose: Shared sport domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';

export type SportStatus = 'active' | 'disabled' | (string & {});

export type Sport = Readonly<{
  id: string;
  name: string;
  localizedName: string;
  iconKey?: string;
  icon?: string;
  image?: string;
  visible: boolean;
  popular: boolean;
  status: SportStatus;
  createdAt?: string;
  updatedAt?: string;
}>;

export type SportsPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type SportsResponse = Readonly<{
  data: ReadonlyArray<Sport>;
  pagination: SportsPagination;
}>;

export interface SportActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
