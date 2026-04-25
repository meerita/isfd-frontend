/** @format */

// File: src/_types/auth.ts
// Purpose: Authentication-related shared types matching the ISFD backend contract
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { JwtPayload } from 'jsonwebtoken';

import type { ApiErrorResponse } from './api';

// --- Step 1: Start login ---

export interface StartLoginResponse {
  user_id: string;
  otp_challenge_id: string;
  otp_code?: string; // only present in local/dev environment
  otp_expires_at: string;
}

// --- Step 1: Start registration ---

export interface StartRegistrationResponse {
  user_id: string;
  user_number: number;
  username: string;
  otp_challenge_id: string;
  otp_code?: string; // only present in local/dev environment
  otp_expires_at: string;
}

// --- Step 2: Verify login OTP — session is born here ---

export interface VerifyLoginOtpResponse {
  user_id: string;
  session_id: string;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

// --- Refresh session response (same shape as verify login OTP) ---

export type RefreshSessionResponse = VerifyLoginOtpResponse;

// --- Normalized session stored in cookies ---

export interface NormalizedSession {
  sessionId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

// --- JWT access token claims ---
// sub = user_id, sid = session_id, role = platform_role

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  role: string;
}

// --- /api/v1/me response ---

export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
  platform_role: string;
  status: string;
  session_id: string;
  issued_at: string;
  expires_at: string;
}

// --- /api/v1/sessions/current response ---

export interface CurrentSession {
  session_id: string;
  user_id: string;
  device_id: string;
  created_at: string;
  last_seen_at: string;
  refresh_token_expires_at: string;
}

// --- Login form state ---

export interface LoginActionState {
  status: 'idle' | 'awaiting_otp' | 'success' | 'error';
  step: 'credentials' | 'otp';
  error?: ApiErrorResponse;
  challengeId?: string; // otp_challenge_id from step 1
  otpCode?: string; // only in dev
  otpExpiresAt?: string;
}

// --- Register form state ---

export interface RegisterActionState {
  status: 'idle' | 'awaiting_otp' | 'success' | 'error';
  step: 'credentials' | 'otp';
  error?: ApiErrorResponse;
  challengeId?: string;
  email?: string;
  otpCode?: string; // only in dev
  otpExpiresAt?: string;
}
