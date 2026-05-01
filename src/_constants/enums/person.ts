/** @format */

import {
  createEnumOptions,
  getEnumLabel,
  toEnumValue,
} from '@/_constants/enums/helpers';

export const PERSON_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type PersonGender = (typeof PERSON_GENDERS)[number];

const PERSON_GENDER_LABELS: Readonly<Record<PersonGender, string>> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

const PERSON_GENDER_OPTIONS = createEnumOptions(
  PERSON_GENDERS,
  PERSON_GENDER_LABELS,
);

export const PERSON_HAIR_COLORS = [
  'BLACK',
  'BROWN',
  'BLONDE',
  'RED',
  'GRAY',
  'WHITE',
  'BALD',
  'OTHER',
] as const;
export type PersonHairColor = (typeof PERSON_HAIR_COLORS)[number];

const PERSON_HAIR_COLOR_LABELS: Readonly<Record<PersonHairColor, string>> = {
  BLACK: 'Black',
  BROWN: 'Brown',
  BLONDE: 'Blonde',
  RED: 'Red',
  GRAY: 'Gray',
  WHITE: 'White',
  BALD: 'Bald',
  OTHER: 'Other',
};

const PERSON_HAIR_COLOR_OPTIONS = createEnumOptions(
  PERSON_HAIR_COLORS,
  PERSON_HAIR_COLOR_LABELS,
);

export const PERSON_ETHNICITIES = [
  'WHITE',
  'BLACK',
  'ASIAN',
  'HISPANIC',
  'MIDDLE_EASTERN',
  'MIXED',
  'OTHER',
] as const;
export type PersonEthnicity = (typeof PERSON_ETHNICITIES)[number];

const PERSON_ETHNICITY_LABELS: Readonly<Record<PersonEthnicity, string>> = {
  WHITE: 'White',
  BLACK: 'Black',
  ASIAN: 'Asian',
  HISPANIC: 'Hispanic',
  MIDDLE_EASTERN: 'Middle Eastern',
  MIXED: 'Mixed',
  OTHER: 'Other',
};

const PERSON_ETHNICITY_OPTIONS = createEnumOptions(
  PERSON_ETHNICITIES,
  PERSON_ETHNICITY_LABELS,
);

export const PERSON_SKIN_COLORS = [
  'VERY_LIGHT',
  'LIGHT',
  'MEDIUM',
  'DARK',
  'VERY_DARK',
  'OTHER',
] as const;
export type PersonSkinColor = (typeof PERSON_SKIN_COLORS)[number];

const PERSON_SKIN_COLOR_LABELS: Readonly<Record<PersonSkinColor, string>> = {
  VERY_LIGHT: 'Very light',
  LIGHT: 'Light',
  MEDIUM: 'Medium',
  DARK: 'Dark',
  VERY_DARK: 'Very dark',
  OTHER: 'Other',
};

const PERSON_SKIN_COLOR_OPTIONS = createEnumOptions(
  PERSON_SKIN_COLORS,
  PERSON_SKIN_COLOR_LABELS,
);

export const PERSON_DOMINANT_FEET = [
  'LEFT',
  'RIGHT',
  'BOTH',
  'OTHER',
  'UNKNOWN',
] as const;
export type PersonDominantFoot = (typeof PERSON_DOMINANT_FEET)[number];

const PERSON_DOMINANT_FOOT_LABELS: Readonly<
  Record<PersonDominantFoot, string>
> = {
  LEFT: 'Left',
  RIGHT: 'Right',
  BOTH: 'Both',
  OTHER: 'Other',
  UNKNOWN: 'Unknown',
};

const PERSON_DOMINANT_FOOT_OPTIONS = createEnumOptions(
  PERSON_DOMINANT_FEET,
  PERSON_DOMINANT_FOOT_LABELS,
);

export const PERSON_CURRENT_PROFESSIONS = [
  'PLAYER',
  'COACH',
  'MANAGER',
  'PRESIDENT',
  'REFEREE',
  'DIRECTOR',
  'EXECUTIVE',
  'FORMER_PLAYER',
  'OTHER',
] as const;
export type PersonCurrentProfession =
  (typeof PERSON_CURRENT_PROFESSIONS)[number];

const PERSON_CURRENT_PROFESSION_LABELS: Readonly<
  Record<PersonCurrentProfession, string>
> = {
  PLAYER: 'Player',
  COACH: 'Coach',
  MANAGER: 'Manager',
  PRESIDENT: 'President',
  REFEREE: 'Referee',
  DIRECTOR: 'Director',
  EXECUTIVE: 'Executive',
  FORMER_PLAYER: 'Former player',
  OTHER: 'Other',
};

const PERSON_CURRENT_PROFESSION_OPTIONS = createEnumOptions(
  PERSON_CURRENT_PROFESSIONS,
  PERSON_CURRENT_PROFESSION_LABELS,
);

export function parsePersonGender(value: unknown): PersonGender | null {
  return toEnumValue(value, PERSON_GENDERS);
}

export function getPersonGenderOptions() {
  return PERSON_GENDER_OPTIONS;
}

export function getPersonGenderLabel(
  value: PersonGender | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_GENDER_LABELS);
}

export function parsePersonHairColor(value: unknown): PersonHairColor | null {
  return toEnumValue(value, PERSON_HAIR_COLORS);
}

export function getPersonHairColorOptions() {
  return PERSON_HAIR_COLOR_OPTIONS;
}

export function getPersonHairColorLabel(
  value: PersonHairColor | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_HAIR_COLOR_LABELS);
}

export function parsePersonEthnicity(value: unknown): PersonEthnicity | null {
  return toEnumValue(value, PERSON_ETHNICITIES);
}

export function getPersonEthnicityOptions() {
  return PERSON_ETHNICITY_OPTIONS;
}

export function getPersonEthnicityLabel(
  value: PersonEthnicity | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_ETHNICITY_LABELS);
}

export function parsePersonSkinColor(value: unknown): PersonSkinColor | null {
  return toEnumValue(value, PERSON_SKIN_COLORS);
}

export function getPersonSkinColorOptions() {
  return PERSON_SKIN_COLOR_OPTIONS;
}

export function getPersonSkinColorLabel(
  value: PersonSkinColor | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_SKIN_COLOR_LABELS);
}

export function parsePersonDominantFoot(
  value: unknown,
): PersonDominantFoot | null {
  return toEnumValue(value, PERSON_DOMINANT_FEET);
}

export function getPersonDominantFootOptions() {
  return PERSON_DOMINANT_FOOT_OPTIONS;
}

export function getPersonDominantFootLabel(
  value: PersonDominantFoot | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_DOMINANT_FOOT_LABELS);
}

export function parsePersonCurrentProfession(
  value: unknown,
): PersonCurrentProfession | null {
  return toEnumValue(value, PERSON_CURRENT_PROFESSIONS);
}

export function getPersonCurrentProfessionOptions() {
  return PERSON_CURRENT_PROFESSION_OPTIONS;
}

export function getPersonCurrentProfessionLabel(
  value: PersonCurrentProfession | null | undefined,
): string | null {
  return getEnumLabel(value, PERSON_CURRENT_PROFESSION_LABELS);
}
