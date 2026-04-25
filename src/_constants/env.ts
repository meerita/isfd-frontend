/** @format */

// File: src/_constants/env.ts
// Purpose: Centralize environment-driven configuration
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

const ENV = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  refreshTokenMaxAgeSeconds: Number(
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_MAX_AGE ?? 60 * 60 * 24 * 30,
  ),
};

export default ENV;
