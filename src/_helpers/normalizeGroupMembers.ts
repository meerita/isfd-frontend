/** @format */

// File: src/_helpers/normalizeGroupMembers.ts
// Purpose: Normalize group member payloads from the different API response shapes
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { GroupMember } from '@/_types/group';
import type { Gender } from '@/_types/genders';

const DEFAULT_GROUP_MEMBER_STAGE = 'MEMBER';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAnyString(value: unknown): value is string {
  return typeof value === 'string';
}

function getStringValue(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];

  return isString(value) ? value : undefined;
}

function getStringValueAllowEmpty(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];

  return isAnyString(value) ? value : undefined;
}

function getBooleanValue(
  record: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const value = record[key];

  return typeof value === 'boolean' ? value : undefined;
}

function getNumberValue(
  record: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = record[key];

  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function isGender(value: unknown): value is Gender {
  return value === 'MALE' || value === 'FEMALE' || value === 'OTHER';
}

export function normalizeGroupMember(member: unknown): GroupMember | null {
  if (!isRecord(member)) {
    return null;
  }

  const user = isRecord(member.user) ? member.user : undefined;
  const identity = isRecord(user?.identity)
    ? user.identity
    : isRecord(member.identity)
      ? member.identity
      : undefined;
  const profile = isRecord(user?.profile)
    ? user.profile
    : isRecord(member.profile)
      ? member.profile
      : undefined;
  const characteristics = isRecord(profile?.characteristics)
    ? profile.characteristics
    : isRecord(member.characteristics)
      ? member.characteristics
      : undefined;

  const id = getStringValue(member, 'id');
  const groupId = getStringValue(member, 'groupId');
  const userId =
    getStringValue(member, 'userId') ?? getStringValue(user ?? {}, 'id');
  const username =
    getStringValue(identity ?? {}, 'username') ??
    getStringValue(user ?? {}, 'username') ??
    getStringValue(member, 'username') ??
    getStringValue(member, 'userName');
  const tag =
    getStringValueAllowEmpty(identity ?? {}, 'tag') ??
    getStringValueAllowEmpty(user ?? {}, 'tag') ??
    getStringValueAllowEmpty(member, 'tag') ??
    '';
  const role =
    getStringValue(member, 'role') ?? getStringValue(member, 'memberRole');
  const stage =
    getStringValue(member, 'stage') ??
    getStringValue(member, 'memberStage') ??
    DEFAULT_GROUP_MEMBER_STAGE;
  const status = getStringValue(member, 'status');
  const createdAt = getStringValue(member, 'createdAt');
  const updatedAt = getStringValue(member, 'updatedAt');
  const birthdate = getStringValue(characteristics ?? {}, 'birthdate');
  const weight = getNumberValue(characteristics ?? {}, 'weight') ?? 0;
  const height = getNumberValue(characteristics ?? {}, 'height') ?? 0;
  const rawGender = characteristics?.gender;
  const gender = isGender(rawGender) ? rawGender : undefined;
  const name = getStringValueAllowEmpty(profile ?? {}, 'name') ?? '';
  const middlename =
    getStringValueAllowEmpty(profile ?? {}, 'middlename') ?? '';
  const surname = getStringValueAllowEmpty(profile ?? {}, 'surname') ?? '';
  const avatar =
    getStringValueAllowEmpty(profile ?? {}, 'avatar') ??
    getStringValueAllowEmpty(user ?? {}, 'avatar') ??
    getStringValueAllowEmpty(member, 'avatar') ??
    getStringValueAllowEmpty(member, 'imageURL') ??
    '';

  if (
    !id ||
    !groupId ||
    !userId ||
    !username ||
    !role ||
    !status ||
    !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  return {
    id,
    groupId,
    userId,
    identity: { username, tag },
    profile: { name, middlename, surname, avatar },
    characteristics: gender ? { birthdate, weight, height, gender } : undefined,
    role,
    stage,
    status,
    isPrimarySuperAdmin:
      getBooleanValue(member, 'isPrimarySuperAdmin') ?? false,
    createdAt,
    updatedAt,
  };
}

function normalizeGroupMembersCollection(
  candidate: unknown,
): ReadonlyArray<GroupMember> | undefined {
  if (!Array.isArray(candidate)) {
    return undefined;
  }

  const normalizedMembers = candidate
    .map(normalizeGroupMember)
    .filter(function isGroupMember(
      value: GroupMember | null,
    ): value is GroupMember {
      return value !== null;
    });

  if (normalizedMembers.length > 0 || candidate.length === 0) {
    return normalizedMembers;
  }

  return undefined;
}

export function extractGroupMembers(
  record: Record<string, unknown>,
): ReadonlyArray<GroupMember> | undefined {
  const candidateCollections = [
    record.members,
    record.users,
    record.participants,
    record.groupMembers,
  ];

  for (const candidate of candidateCollections) {
    const normalizedMembers = normalizeGroupMembersCollection(candidate);

    if (normalizedMembers) {
      return normalizedMembers;
    }
  }

  return undefined;
}

export function normalizeGroupMembersPayload(
  payload: unknown,
): ReadonlyArray<GroupMember> {
  const normalizedRootCollection = normalizeGroupMembersCollection(payload);

  if (normalizedRootCollection) {
    return normalizedRootCollection;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const normalizedRecordMembers = extractGroupMembers(payload);

  if (normalizedRecordMembers) {
    return normalizedRecordMembers;
  }

  const nestedCandidates = [payload.data, payload.group, payload.result];

  for (const candidate of nestedCandidates) {
    const normalizedCandidateCollection =
      normalizeGroupMembersCollection(candidate);

    if (normalizedCandidateCollection) {
      return normalizedCandidateCollection;
    }

    if (!isRecord(candidate)) {
      continue;
    }

    const normalizedNestedMembers = extractGroupMembers(candidate);

    if (normalizedNestedMembers) {
      return normalizedNestedMembers;
    }
  }

  return [];
}
