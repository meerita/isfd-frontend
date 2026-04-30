/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type PersonSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'is_active_asc'
  | 'is_active_desc'
  | 'full_name_asc'
  | 'full_name_desc'
  | 'display_name_asc'
  | 'display_name_desc';

export type PersonStatusFilter = 'all' | 'active' | 'inactive';

export type PersonListItem = Readonly<{
  id: string;
  fullName: string;
  slug: string;
  displayName: string;
  gender: string;
  currentProfession: string | null;
  primaryNationalityCountryId: string | null;
  avatarImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Person = PersonListItem &
  Readonly<{
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    secondSurname: string | null;
    knownAs: string | null;
    nativeFullName: string | null;
    birthDate: string | null;
    deathDate: string | null;
    isDeceased: boolean;
    birthLocationId: string | null;
    heightCm: number | null;
    weightKg: number | null;
    hairColor: string | null;
    ethnicity: string | null;
    skinColor: string | null;
    dominantFoot: string | null;
    professionalDivisionDebutDate: string | null;
    retirementDate: string | null;
    heroImageUrl: string | null;
  }>;

export type PersonListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: PersonSort;
      status?: PersonStatusFilter;
      gender?: string;
      currentProfession?: string;
    }>;
  }>;

export type PersonListResponse = Readonly<{
  data: ReadonlyArray<PersonListItem>;
  metadata: PersonListMetadata;
  error?: ApiErrorResponse;
}>;

export type PersonDetailResponse = Readonly<{
  data: Person | null;
  error?: ApiErrorResponse;
}>;

export interface PersonActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  personId?: string;
}
