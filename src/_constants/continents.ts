/** @format */

const RAW_CONTINENTS = [
  'EUROPE',
  'ASIA',
  'AFRICA',
  'NORTH_AMERICA',
  'SOUTH_AMERICA',
  'OCEANIA',
  'ANTARCTICA',
] as const;

export type Continent = (typeof RAW_CONTINENTS)[number];

const CONTINENT_LABELS: Readonly<Record<Continent, string>> = {
  EUROPE: 'Europe',
  ASIA: 'Asia',
  AFRICA: 'Africa',
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  OCEANIA: 'Oceania',
  ANTARCTICA: 'Antarctica',
};

const CONTINENTS: ReadonlyArray<Readonly<{ value: Continent; label: string }>> =
  RAW_CONTINENTS.map(value => ({
    value,
    label: CONTINENT_LABELS[value],
  }));

export default CONTINENTS;
