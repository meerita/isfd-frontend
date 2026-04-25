/** @format */

// File: src/_types/user.ts
// Purpose: Shared user domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';
import type { Continent } from '@/_constants/continents';
import type { Gender } from '@/_types/genders';
import type MetricSystem from '@/_types/MetricSystem';

export type UserIdentity = Readonly<{
  username?: string;
  number?: number;
  tag?: string;
}>;

export type UserCharacteristics = Readonly<{
  birthdate?: string | null;
  weight?: number;
  height?: number;
  gender?: Gender;
}>;

export type UserCoordinates = Readonly<{
  lat: number;
  lng: number;
}>;

export type UserLocation = Readonly<{
  continent?: Continent | '';
  country?: string;
  localizedName?: string;
  province?: string;
  city?: string;
  street?: string;
  number?: number;
  zip?: string;
  coords?: UserCoordinates | null;
}>;

export type UserSkillLevel =
  | 'ANY'
  | 'NOVICE'
  | 'ADVANCED_BEGINNER'
  | 'COMPETENT'
  | 'PROFICIENT'
  | 'EXPERT'
  | 'PROFESSIONAL';

export type UserSkill = Readonly<{
  sportId: string;
  level: UserSkillLevel;
}>;

export type UserProfile = Readonly<{
  name?: string;
  middlename?: string;
  surname?: string;
  avatar?: string;
  description?: string;
  characteristics?: UserCharacteristics;
  location?: UserLocation;
  skills?: ReadonlyArray<UserSkill>;
}>;

export type UserPhoneVerification = Readonly<{
  number?: string;
  country?: string;
  verified?: boolean;
  primary?: boolean;
}>;

export type UserVerification = Readonly<{
  isVerified?: boolean;
  phone?: UserPhoneVerification;
}>;

export type UserAccess = Readonly<{
  isAdmin?: boolean;
  isActive?: boolean;
  isBanned?: boolean;
  isDisabled?: boolean;
  isSubscribed?: boolean;
}>;

export type UserNotificationGroupSettings = Readonly<{
  events?: boolean;
  invites?: boolean;
  members?: boolean;
  petitions?: boolean;
  records?: boolean;
}>;

export type UserNotificationGeneralSettings = Readonly<{
  announcements?: boolean;
  updates?: boolean;
}>;

export type UserNotificationsSettings = Readonly<{
  group?: UserNotificationGroupSettings;
  general?: UserNotificationGeneralSettings;
}>;

export type UserPreferencesSettings = Readonly<{
  dimensions?: MetricSystem;
  weights?: MetricSystem;
  language?: string;
  theme?: boolean;
}>;

export type UserPrivacyProSettings = Readonly<{
  invisible?: boolean;
  hideActivity?: boolean;
}>;

export type UserPrivacyGeneralSettings = Readonly<{
  hiddenInSearch?: boolean;
  hideMyGroups?: boolean;
}>;

export type UserPrivacyCookieSettings = Readonly<{
  analytics?: boolean;
  marketing?: boolean;
  other?: boolean;
}>;

export type UserPrivacySettings = Readonly<{
  pro?: UserPrivacyProSettings;
  general?: UserPrivacyGeneralSettings;
  cookies?: UserPrivacyCookieSettings;
}>;

export type UserSettings = Readonly<{
  notifications?: UserNotificationsSettings;
  preferences?: UserPreferencesSettings;
  privacy?: UserPrivacySettings;
}>;

export type UserLegalTerms = Readonly<{
  terms?: number;
  privacy?: number;
  subscriptions?: number;
}>;

export type UserLegal = Readonly<{
  acceptedTerms?: boolean;
  firstTimer?: boolean;
  terms?: UserLegalTerms;
}>;

export type UserMetadata = Readonly<{
  createdAt?: string;
  updatedAt?: string;
}>;

export type User = Readonly<{
  uuid: string;
  identity?: UserIdentity;
  profile?: UserProfile;
  verification?: UserVerification;
  access?: UserAccess;
  settings?: UserSettings;
  legal?: UserLegal;
  metadata: UserMetadata;
}>;

export type UsersPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type UsersResponse = Readonly<{
  data: ReadonlyArray<User>;
  pagination: UsersPagination;
}>;

export interface UserActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
