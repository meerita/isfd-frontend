/** @format */

// File: src/_types/group.ts
// Purpose: Shared group domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ContinentCode } from '@/_constants/continents';
import type { ApiErrorResponse } from '@/_types/api';
import type { Gender } from '@/_types/genders';
import type { UserSkillLevel } from '@/_types/user';

export type GroupPrivacy = 'PUBLIC' | 'PRIVATE' | (string & {});
export type GroupVisibility =
  | 'VISIBLE'
  | 'INVISIBLE'
  | 'HIDDEN'
  | (string & {});
export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'DISABLED' | (string & {});
export type GroupJoinMode = 'FREE' | 'APPROVAL' | 'INVITE' | (string & {});
export type GroupEventActor =
  | 'ADMIN'
  | 'MEMBER'
  | 'SUPERADMIN'
  | 'NOOB'
  | (string & {});
export type GroupEventCreation = GroupEventActor;
export type GroupEventParticipation =
  | GroupEventActor
  | 'ANYONE'
  | (string & {});
export type GroupEventReplacements =
  | 'ALLOWED'
  | 'NOT_ALLOWED'
  | 'AUTOMATIC'
  | (string & {});
export type GroupEventActivity =
  | 'TYPE_ONE'
  | 'TYPE_TWO'
  | 'TYPE_THREE'
  | 'TYPE_FOUR'
  | 'TYPE_FIVE'
  | (string & {});

export type GroupSport = Readonly<{
  id?: string;
  localizedName?: string;
  iconURL?: string;
}>;

export type GroupLocation = Readonly<{
  continent?: ContinentCode;
  country?: string;
  localizedName?: string;
  province?: string;
  city?: string;
  street?: string;
  number?: number;
  zip?: string;
  coords?: Readonly<{
    latitude: number;
    longitude: number;
  }>;
}>;

export type GroupMemberIdentity = Readonly<{
  username: string;
  tag: string;
}>;

export type GroupMemberProfile = Readonly<{
  name: string;
  middlename: string;
  surname: string;
  avatar: string;
}>;

export type GroupMemberCharacteristics = Readonly<{
  birthdate?: string;
  weight: number;
  height: number;
  gender: Gender;
}>;

export type GroupMemberRole = 'SUPERADMIN' | 'ADMIN' | 'MEMBER' | (string & {});

export type GroupMemberStage = 'NOOB' | (string & {});

export type GroupMemberStatus = 'ACTIVE' | 'INACTIVE' | (string & {});

export type GroupMember = Readonly<{
  id: string;
  groupId: string;
  userId: string;
  identity: GroupMemberIdentity;
  profile: GroupMemberProfile;
  characteristics?: GroupMemberCharacteristics;
  role: GroupMemberRole;
  stage: GroupMemberStage;
  status: GroupMemberStatus;
  isPrimarySuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type GroupEventPreferences = Readonly<{
  creation?: GroupEventCreation;
  gender?: Gender;
  skill?: UserSkillLevel;
  participation?: GroupEventParticipation;
  visibility?: boolean;
  replacements?: GroupEventReplacements;
  invitations?: boolean;
  activity?: GroupEventActivity;
}>;

export type GroupMembershipPreferences = Readonly<{
  privacy?: GroupPrivacy;
  joinMode?: GroupJoinMode;
}>;

export type GroupVisibilityPreferences = Readonly<{
  visibility?: GroupVisibility;
}>;

export type GroupPreferences = Readonly<{
  events?: GroupEventPreferences;
  membership?: GroupMembershipPreferences;
  visibility?: GroupVisibilityPreferences;
}>;

export type Group = Readonly<{
  id: string;
  name: string;
  description?: string;
  slug?: string;
  imageURL?: string;
  privacy?: GroupPrivacy;
  visibility?: GroupVisibility;
  joinMode?: GroupJoinMode;
  preferences?: GroupPreferences;
  status?: GroupStatus;
  sport?: GroupSport;
  location?: GroupLocation;
  members?: ReadonlyArray<GroupMember>;
  createdAt?: string;
  updatedAt?: string;
  canViewInternalContent?: boolean;
  canManageGroup?: boolean;
  viewerIsMember?: boolean;
}>;

export type GroupsPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type GroupsResponse = Readonly<{
  data: ReadonlyArray<Group>;
  pagination: GroupsPagination;
}>;

export interface GroupActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
}
