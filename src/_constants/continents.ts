/** @format */

import {
  createEnumOptions,
  getEnumLabel,
  toEnumValue,
} from '@/_constants/enums/helpers';

export const CONTINENT_CODES = [
  'EU',
  'AS',
  'AF',
  'NA',
  'SA',
  'OC',
  'AN',
] as const;

export type ContinentCode = (typeof CONTINENT_CODES)[number];

const CONTINENT_LABELS: Readonly<Record<ContinentCode, string>> = {
  EU: 'Europe',
  AS: 'Asia',
  AF: 'Africa',
  NA: 'North America',
  SA: 'South America',
  OC: 'Oceania',
  AN: 'Antarctica',
};

const CONTINENT_OPTIONS = createEnumOptions(CONTINENT_CODES, CONTINENT_LABELS);

export function parseContinentCode(value: unknown): ContinentCode | null {
  return toEnumValue(value, CONTINENT_CODES);
}

export function isContinentCode(value: unknown): value is ContinentCode {
  return parseContinentCode(value) !== null;
}

export function getContinentOptions() {
  return CONTINENT_OPTIONS;
}

export function getContinentLabel(
  value: ContinentCode | null | undefined,
): string | null {
  return getEnumLabel(value, CONTINENT_LABELS);
}

const CONTINENTS = CONTINENT_OPTIONS;

export default CONTINENTS;
