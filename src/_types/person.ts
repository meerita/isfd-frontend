/** @format */

import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';
import type {
  PersonCurrentProfession,
  PersonDominantFoot,
  PersonEthnicity,
  PersonGender,
  PersonHairColor,
  PersonSkinColor,
} from '@/_constants/enums/person';

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

export type GeoRef = Readonly<{
  id?: string;
  name: string;
  slug?: string;
}>;

export type PersonCurrentLocationPublic = Readonly<{
  city?: GeoRef;
  province_name?: string;
  country?: GeoRef;
}>;

export type PersonAdminListItem = Readonly<{
  id: string;
  full_name: string;
  slug: string;
  display_name: string;
  gender: PersonGender;
  current_profession?: PersonCurrentProfession | null;
  primary_nationality_country_id?: string | null;
  avatar_image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}>;

export type PersonAdminDetail = Readonly<{
  id: string;
  full_name: string;
  slug: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  second_surname?: string | null;
  display_name: string;
  known_as?: string | null;
  native_full_name?: string | null;
  gender: PersonGender;
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased: boolean;
  birth_location_id?: string | null;
  current_city_id?: string | null;
  primary_nationality_country_id?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  hair_color?: PersonHairColor | null;
  ethnicity?: PersonEthnicity | null;
  skin_color?: PersonSkinColor | null;
  dominant_foot?: PersonDominantFoot | null;
  current_profession?: PersonCurrentProfession | null;
  professional_division_debut_date?: string | null;
  retirement_date?: string | null;
  avatar_image_url?: string | null;
  hero_image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}>;

export type CreatePersonRequest = Readonly<{
  full_name: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  second_surname?: string | null;
  display_name?: string | null;
  known_as?: string | null;
  native_full_name?: string | null;
  gender?: PersonGender | null;
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased: boolean;
  birth_location_id?: string | null;
  current_city_id?: string | null;
  primary_nationality_country_id?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  hair_color?: PersonHairColor | null;
  ethnicity?: PersonEthnicity | null;
  skin_color?: PersonSkinColor | null;
  dominant_foot?: PersonDominantFoot | null;
  current_profession?: PersonCurrentProfession | null;
  professional_division_debut_date?: string | null;
  retirement_date?: string | null;
  avatar_image_url?: string | null;
  hero_image_url?: string | null;
  is_active?: boolean;
}>;

export type UpdatePersonRequest = Readonly<{
  full_name?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  second_surname?: string | null;
  display_name?: string | null;
  known_as?: string | null;
  native_full_name?: string | null;
  gender?: PersonGender | null;
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased?: boolean;
  birth_location_id?: string | null;
  current_city_id?: string | null;
  primary_nationality_country_id?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  hair_color?: PersonHairColor | null;
  ethnicity?: PersonEthnicity | null;
  skin_color?: PersonSkinColor | null;
  dominant_foot?: PersonDominantFoot | null;
  current_profession?: PersonCurrentProfession | null;
  professional_division_debut_date?: string | null;
  retirement_date?: string | null;
  avatar_image_url?: string | null;
  hero_image_url?: string | null;
  is_active?: boolean;
}>;

export type PersonPublicDetail = Readonly<{
  slug: string;
  full_name: string;
  display_name: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  second_surname?: string | null;
  known_as?: string | null;
  native_full_name?: string | null;
  gender: PersonGender;
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased: boolean;
  birth_location?: GeoRef | null;
  current_location?: PersonCurrentLocationPublic | null;
  primary_nationality?: GeoRef | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  hair_color?: PersonHairColor | null;
  ethnicity?: PersonEthnicity | null;
  skin_color?: PersonSkinColor | null;
  dominant_foot?: PersonDominantFoot | null;
  current_profession?: PersonCurrentProfession | null;
  professional_division_debut_date?: string | null;
  retirement_date?: string | null;
  avatar_image_url?: string | null;
  hero_image_url?: string | null;
}>;

export type PersonListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: PersonSort;
      status?: PersonStatusFilter;
      gender?: PersonGender;
      current_profession?: PersonCurrentProfession;
    }>;
  }>;

export type PersonAdminListResponse = Readonly<{
  data: ReadonlyArray<PersonAdminListItem>;
  metadata: PersonListMetadata;
  error?: ApiErrorResponse;
}>;

export type PersonAdminDetailResponse = Readonly<{
  data: PersonAdminDetail | null;
  error?: ApiErrorResponse;
}>;

export type PersonPublicDetailResponse = Readonly<{
  data: PersonPublicDetail | null;
  error?: ApiErrorResponse;
}>;

export interface PersonActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  personId?: string;
}
