/** @format */

import type {
  GroupEventActor,
  GroupEventActivity,
  GroupEventCreation,
  GroupEventParticipation,
  GroupEventReplacements,
  GroupJoinMode,
  GroupPrivacy,
  GroupVisibility,
} from '@/_types/group';
import type { Gender } from '@/_types/genders';
import type { UserSkillLevel } from '@/_types/user';

type Option<T extends string> = Readonly<{ value: T; label: string }>;

export const GROUP_PRIVACY_OPTIONS: ReadonlyArray<
  Option<GroupPrivacy>
> = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
];

export const GROUP_VISIBILITY_OPTIONS: ReadonlyArray<
  Option<GroupVisibility>
> = [
  { value: 'VISIBLE', label: 'Visible' },
  { value: 'INVISIBLE', label: 'Invisible' },
];

export const GROUP_JOIN_MODE_OPTIONS: ReadonlyArray<
  Option<GroupJoinMode>
> = [
  { value: 'FREE', label: 'Free' },
  { value: 'APPROVAL', label: 'Approval Required' },
  { value: 'INVITE', label: 'Invitation Only' },
];

export const GROUP_EVENT_ACTOR_OPTIONS: ReadonlyArray<
  Option<GroupEventActor>
> = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'NOOB', label: 'Newcomer' },
];

export const GROUP_EVENT_CREATION_OPTIONS: ReadonlyArray<
  Option<GroupEventCreation>
> = GROUP_EVENT_ACTOR_OPTIONS;

export const GROUP_EVENT_PARTICIPATION_OPTIONS: ReadonlyArray<
  Option<GroupEventParticipation>
> = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'NOOB', label: 'Newcomer' },
  { value: 'ANYONE', label: 'Anyone' },
];

export const GROUP_EVENT_REPLACEMENTS_OPTIONS: ReadonlyArray<
  Option<GroupEventReplacements>
> = [
  { value: 'ALLOWED', label: 'Allowed' },
  { value: 'NOT_ALLOWED', label: 'Not Allowed' },
  { value: 'AUTOMATIC', label: 'Automatic' },
];

export const GROUP_EVENT_ACTIVITY_OPTIONS: ReadonlyArray<
  Option<GroupEventActivity>
> = [
  { value: 'TYPE_ONE', label: 'Type 1' },
  { value: 'TYPE_TWO', label: 'Type 2' },
  { value: 'TYPE_THREE', label: 'Type 3' },
  { value: 'TYPE_FOUR', label: 'Type 4' },
  { value: 'TYPE_FIVE', label: 'Type 5' },
];

export const GROUP_EVENT_GENDER_OPTIONS: ReadonlyArray<
  Option<Gender>
> = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const GROUP_EVENT_SKILL_OPTIONS: ReadonlyArray<
  Option<UserSkillLevel>
> = [
  { value: 'ANY', label: 'Any' },
  { value: 'NOVICE', label: 'Novice' },
  { value: 'ADVANCED_BEGINNER', label: 'Advanced Beginner' },
  { value: 'COMPETENT', label: 'Competent' },
  { value: 'PROFICIENT', label: 'Proficient' },
  { value: 'EXPERT', label: 'Expert' },
  { value: 'PROFESSIONAL', label: 'Professional' },
];
