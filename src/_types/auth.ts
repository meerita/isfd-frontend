/** @format */

// File: src/_types/auth.ts
// Purpose: Authentication-related shared types
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { JwtPayload } from 'jsonwebtoken';

import type { ApiErrorResponse } from './api';

export interface AuthTokensResponse {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface NormalizedAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCodeRequestResponse {
  verificationCode?: string;
  expiresAt?: string;
}

export interface AccessTokenPayload extends JwtPayload {
  sid: string;
  tv: number;
  typ: string;
  isAdmin: boolean;
  iss: string;
  sub: string;
  aud: string | string[];
}

export interface LoginActionState {
  status: 'idle' | 'awaiting_code' | 'success' | 'error';
  step: 'credentials' | 'code';
  error?: ApiErrorResponse;
  email?: string;
  verificationCode?: string;
  expiresAt?: string;
}
