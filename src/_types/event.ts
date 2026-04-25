/** @format */

// File: src/_types/event.ts
// Purpose: Shared event domain types for API responses and UI consumption
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { ApiErrorResponse } from '@/_types/api';
import type { Gender } from '@/_types/genders';
import type {
  GroupEventActivity,
  GroupEventReplacements,
} from '@/_types/group';
import type { PlaceCity } from '@/_types/place';
import type { UserSkillLevel } from '@/_types/user';

export type EventStatus =
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'FINISHED'
  | 'DRAFT'
  | (string & {});

export type EventCapacity = Readonly<{
  min?: number;
  max?: number;
}>;

export type EventPreferences = Readonly<{
  gender?: Gender;
  skill?: UserSkillLevel;
  visibility?: boolean;
  replacements?: GroupEventReplacements;
  invitations?: boolean;
  activity?: GroupEventActivity;
}>;

export type EventSport = Readonly<{
  id?: string;
  name?: string;
  localizedName?: string;
}>;

export type EventGroup = Readonly<{
  id?: string;
  name?: string;
}>;

export type EventPlace = Readonly<{
  id?: string;
  name?: string;
  city?: PlaceCity | string;
}>;

export type Event = Readonly<{
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sportId?: string;
  groupId?: string;
  placeId?: string;
  sport?: EventSport | string;
  group?: EventGroup | string;
  place?: EventPlace | string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  capacity?: EventCapacity;
  preferences?: EventPreferences;
  status?: EventStatus;
  createdAt?: string;
  updatedAt?: string;
}>;

export type EventsPagination = Readonly<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}>;

export type EventsResponse = Readonly<{
  data?: ReadonlyArray<Event>;
  results?: ReadonlyArray<Event>;
  pagination: EventsPagination;
}>;

export interface EventActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  eventId?: string;
}
