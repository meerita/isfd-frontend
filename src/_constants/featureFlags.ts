/** @format */

// File: src/_constants/featureFlags.ts
// Purpose: Shared feature flag catalogs for statuses and targeting platforms
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

export const FEATURE_FLAG_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const FEATURE_FLAG_STATUS_OPTIONS = [
  { value: FEATURE_FLAG_STATUS.ACTIVE, label: 'Active' },
  { value: FEATURE_FLAG_STATUS.INACTIVE, label: 'Inactive' },
] as const;

export const FEATURE_FLAG_PLATFORMS = {
  IOS: 'IOS',
  ANDROID: 'ANDROID',
  WEB: 'WEB',
} as const;

export const FEATURE_FLAG_PLATFORM_OPTIONS = [
  { value: FEATURE_FLAG_PLATFORMS.IOS, label: 'iOS' },
  { value: FEATURE_FLAG_PLATFORMS.ANDROID, label: 'Android' },
  { value: FEATURE_FLAG_PLATFORMS.WEB, label: 'Web' },
] as const;
