/** @format */

export const STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DISMISSED: 'DISMISSED',
  DRAFT: 'DRAFT',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  IN_PROGRESS: 'IN_PROGRESS',
  INTERVIEW: 'INTERVIEW',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REVIEW: 'REVIEW',
} as const;

export const SPORT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
] as const;

export type StatusType = keyof typeof STATUS;
