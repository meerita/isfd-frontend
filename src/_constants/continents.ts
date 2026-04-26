/** @format */

// Continent codes as returned by the backend (ISO standard 2-letter codes)
const RAW_CONTINENT_CODES = [
  'EU',
  'AS',
  'AF',
  'NA',
  'SA',
  'OC',
  'AN',
] as const;

export type ContinentCode = (typeof RAW_CONTINENT_CODES)[number];

const CONTINENT_LABELS: Readonly<Record<ContinentCode, string>> = {
  EU: 'Europe',
  AS: 'Asia',
  AF: 'Africa',
  NA: 'North America',
  SA: 'South America',
  OC: 'Oceania',
  AN: 'Antarctica',
};

const CONTINENTS: ReadonlyArray<
  Readonly<{ value: ContinentCode; label: string }>
> = RAW_CONTINENT_CODES.map(value => ({
  value,
  label: CONTINENT_LABELS[value],
}));

export default CONTINENTS;
