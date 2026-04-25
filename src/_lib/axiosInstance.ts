/** @format */

// File: src/_lib/axiosInstance.ts
// Purpose: Shared Axios instance configured for Sport App API
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import axios from 'axios';

import ENV from '@/_constants/env';

const axiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45_000,
});

export default axiosInstance;
