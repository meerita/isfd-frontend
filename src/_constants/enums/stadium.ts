/** @format */

import {
  createEnumOptions,
  getEnumLabel,
  toEnumValue,
} from '@/_constants/enums/helpers';

export const STADIUM_SURFACE_TYPES = [
  'NATURAL_GRASS',
  'ARTIFICIAL_TURF',
  'HYBRID',
  'CLAY',
  'SAND',
  'CONCRETE',
  'OTHER',
] as const;

export type StadiumSurfaceType = (typeof STADIUM_SURFACE_TYPES)[number];

const STADIUM_SURFACE_TYPE_LABELS: Readonly<
  Record<StadiumSurfaceType, string>
> = {
  NATURAL_GRASS: 'Natural grass',
  ARTIFICIAL_TURF: 'Artificial turf',
  HYBRID: 'Hybrid',
  CLAY: 'Clay',
  SAND: 'Sand',
  CONCRETE: 'Concrete',
  OTHER: 'Other',
};

const STADIUM_SURFACE_TYPE_OPTIONS = createEnumOptions(
  STADIUM_SURFACE_TYPES,
  STADIUM_SURFACE_TYPE_LABELS,
);

export function parseStadiumSurfaceType(
  value: unknown,
): StadiumSurfaceType | null {
  return toEnumValue(value, STADIUM_SURFACE_TYPES);
}

export function getStadiumSurfaceTypeOptions() {
  return STADIUM_SURFACE_TYPE_OPTIONS;
}

export function getStadiumSurfaceTypeLabel(
  value: StadiumSurfaceType | null | undefined,
): string | null {
  return getEnumLabel(value, STADIUM_SURFACE_TYPE_LABELS);
}
