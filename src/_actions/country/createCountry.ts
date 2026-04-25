/** @format */

'use server';

// File: src/_actions/country/createCountry.ts
// Purpose: Stub server action for creating countries via CountryForm
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { Country } from '@/_types/country';

type CountryFormPayload = Readonly<
  Pick<Country, 'name' | 'continent' | 'countryCode' | 'active'> & {
    coordinates: Readonly<{ lat: number | null; lng: number | null }>;
    provinces: ReadonlyArray<string>;
  }
>;

const getStringValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

const getBooleanValue = (formData: FormData, key: string): boolean => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
};

const getNumberValue = (formData: FormData, key: string): number | null => {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildPayload = (formData: FormData): CountryFormPayload => ({
  name: getStringValue(formData, 'name'),
  continent: getStringValue(formData, 'continent') as Country['continent'],
  countryCode: getStringValue(formData, 'countryCode'),
  active: getBooleanValue(formData, 'active'),
  coordinates: {
    lat: getNumberValue(formData, 'latitude'),
    lng: getNumberValue(formData, 'longitude'),
  },
  provinces: formData
    .getAll('provinces')
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(value => value.length > 0),
});

export async function createCountry(formData: FormData): Promise<void> {
  const payload = buildPayload(formData);
  console.info('[createCountry] Stub payload', payload);
}
