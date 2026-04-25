/** @format */

// File: src/_actions/event/_helpers.ts
// Purpose: Share event form parsing and request body helpers across actions
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';
import type { EventStatus } from '@/_types/event';
import type { Gender } from '@/_types/genders';
import type {
  GroupEventActivity,
  GroupEventReplacements,
} from '@/_types/group';
import type { UserSkillLevel } from '@/_types/user';

export type EventRequestBody = Readonly<{
  title: string;
  description?: string;
  imageUrl?: string;
  sportId: string;
  groupId: string;
  placeId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  capacity: Readonly<{
    min: number;
    max: number;
  }>;
  preferences: Readonly<{
    gender: Gender;
    skill: UserSkillLevel;
    visibility: boolean;
    replacements: GroupEventReplacements;
    invitations: boolean;
    activity: GroupEventActivity;
  }>;
  status?: EventStatus;
}>;

type BuildEventRequestBodyResult = Readonly<{
  body?: EventRequestBody;
  error?: ApiErrorResponse;
}>;

function buildValidationError(
  message: string,
  error: string,
): ApiErrorResponse {
  return {
    reason: 'FORM_VALIDATION_ERROR',
    message,
    error,
  } satisfies ApiErrorResponse;
}

export function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalStringValue(
  formData: FormData,
  key: string,
): string | undefined {
  const value = getStringValue(formData, key);
  return value.length > 0 ? value : undefined;
}

function getIntegerValue(formData: FormData, key: string): number | undefined {
  const value = getStringValue(formData, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.trunc(parsed);
}

function getBooleanValue(formData: FormData, key: string): boolean {
  const value = getStringValue(formData, key).toLowerCase();

  return value === 'true' || value === 'on' || value === '1';
}

function getIsoDateTimeValue(
  formData: FormData,
  key: string,
): string | undefined {
  const value = getStringValue(formData, key);

  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

export function buildEventRequestBody(
  formData: FormData,
): BuildEventRequestBodyResult {
  const title = getStringValue(formData, 'title');
  const description = getOptionalStringValue(formData, 'description');
  const imageUrl = getOptionalStringValue(formData, 'imageUrl');
  const sportId = getStringValue(formData, 'sportId');
  const groupId = getStringValue(formData, 'groupId');
  const placeId = getStringValue(formData, 'placeId');
  const startTime = getIsoDateTimeValue(formData, 'startTime');
  const endTime = getIsoDateTimeValue(formData, 'endTime');
  const timezone = getStringValue(formData, 'timezone');
  const minCapacity = getIntegerValue(formData, 'capacityMin');
  const maxCapacity = getIntegerValue(formData, 'capacityMax');
  const gender = (getStringValue(formData, 'preferenceGender') ||
    'OTHER') as Gender;
  const skill = (getStringValue(formData, 'preferenceSkill') ||
    'ANY') as UserSkillLevel;
  const replacements = (getStringValue(formData, 'preferenceReplacements') ||
    'ALLOWED') as GroupEventReplacements;
  const activity = (getStringValue(formData, 'preferenceActivity') ||
    'TYPE_ONE') as GroupEventActivity;
  const visibility = getBooleanValue(formData, 'preferenceVisibility');
  const invitations = getBooleanValue(formData, 'preferenceInvitations');
  const status = getOptionalStringValue(formData, 'status') as
    | EventStatus
    | undefined;

  if (
    !title ||
    !sportId ||
    !groupId ||
    !placeId ||
    !startTime ||
    !endTime ||
    !timezone ||
    typeof minCapacity !== 'number' ||
    typeof maxCapacity !== 'number'
  ) {
    return {
      error: buildValidationError(
        'Missing required event fields.',
        'Title, sport, group, place, schedule, timezone and capacity are required.',
      ),
    } satisfies BuildEventRequestBodyResult;
  }

  if (minCapacity < 0 || maxCapacity < 0) {
    return {
      error: buildValidationError(
        'Capacity cannot be negative.',
        'Use a zero or positive number for minimum and maximum capacity.',
      ),
    } satisfies BuildEventRequestBodyResult;
  }

  if (minCapacity > maxCapacity) {
    return {
      error: buildValidationError(
        'Invalid capacity range.',
        'Minimum capacity cannot be greater than maximum capacity.',
      ),
    } satisfies BuildEventRequestBodyResult;
  }

  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    return {
      error: buildValidationError(
        'Invalid event schedule.',
        'End time must be later than start time.',
      ),
    } satisfies BuildEventRequestBodyResult;
  }

  const body: Record<string, unknown> = {
    title,
    sportId,
    groupId,
    placeId,
    startTime,
    endTime,
    timezone,
    capacity: {
      min: minCapacity,
      max: maxCapacity,
    },
    preferences: {
      gender,
      skill,
      visibility,
      replacements,
      invitations,
      activity,
    },
  };

  if (description) {
    body.description = description;
  }

  if (imageUrl) {
    body.imageUrl = imageUrl;
  }

  if (status) {
    body.status = status;
  }

  return {
    body: body as EventRequestBody,
  } satisfies BuildEventRequestBodyResult;
}

export function resolveEventId(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  if ('id' in payload && typeof payload.id === 'string') {
    return payload.id;
  }

  if (
    'data' in payload &&
    typeof payload.data === 'object' &&
    payload.data !== null &&
    'id' in payload.data &&
    typeof payload.data.id === 'string'
  ) {
    return payload.data.id;
  }

  if (
    'event' in payload &&
    typeof payload.event === 'object' &&
    payload.event !== null &&
    'id' in payload.event &&
    typeof payload.event.id === 'string'
  ) {
    return payload.event.id;
  }

  return undefined;
}
