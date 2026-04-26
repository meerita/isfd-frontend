/** @format */

'use server';

// File: src/_actions/country/updateCountry.ts
// Purpose: Partially update a country via PATCH /admin/countries/{id}
// Only sends fields that changed. Nullable fields send null to clear.

import { revalidatePath } from 'next/cache';
import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import { getAuthenticatedRequestHeaders } from '@/_lib/authTokens';
import api from '@/_lib/axiosInstance';
import type { CountryActionState } from '@/_types/country';

const UNSET = Symbol('unset');

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

// Include only if value changed. Empty string on a nullable field → null (clear).
function partialNullable(
  value: string,
  original: string,
): string | null | typeof UNSET {
  if (value === original) return UNSET;
  return value || null;
}

// Include only if changed. Never send null/empty (validated below).
function partialRequired(
  value: string,
  original: string,
): string | typeof UNSET {
  if (value === original) return UNSET;
  return value;
}

const MISSING_ID_RESPONSE: CountryActionState = {
  status: 'error',
  error: {
    reason: 'FORM_VALIDATION_ERROR',
    message: 'Missing country identifier.',
    error: 'Country identifier is required to update the record.',
  },
};

export async function updateCountry(
  _prevState: CountryActionState,
  formData: FormData,
): Promise<CountryActionState> {
  const countryId = str(formData, 'countryId');
  if (!countryId) return MISSING_ID_RESPONSE;

  const name = str(formData, 'name');
  const iso2Code = str(formData, 'iso2Code');
  const iso3Code = str(formData, 'iso3Code');
  const continentCode = str(formData, 'continentCode');
  const flagImageUrl = str(formData, 'flagImageUrl');

  const originalName = str(formData, 'original_name');
  const originalIso2Code = str(formData, 'original_iso2Code');
  const originalIso3Code = str(formData, 'original_iso3Code');
  const originalContinentCode = str(formData, 'original_continentCode');
  const originalFlagImageUrl = str(formData, 'original_flagImageUrl');

  const body: Record<string, unknown> = {};

  // name: required — never null, never empty
  const nameResult = partialRequired(name, originalName);
  if (nameResult !== UNSET) {
    if (!nameResult) {
      return {
        status: 'error',
        error: {
          reason: 'FORM_VALIDATION_ERROR',
          message: 'Country name cannot be empty.',
          error: 'Country name cannot be empty.',
        },
      };
    }
    body.name = nameResult;
  }

  // nullable fields: empty string → null (clear the value on backend)
  const iso2Result = partialNullable(iso2Code, originalIso2Code);
  if (iso2Result !== UNSET) body.iso2_code = iso2Result;

  const iso3Result = partialNullable(iso3Code, originalIso3Code);
  if (iso3Result !== UNSET) body.iso3_code = iso3Result;

  const continentResult = partialNullable(continentCode, originalContinentCode);
  if (continentResult !== UNSET) body.continent_code = continentResult;

  const flagResult = partialNullable(flagImageUrl, originalFlagImageUrl);
  if (flagResult !== UNSET) body.flag_image_url = flagResult;

  if (Object.keys(body).length === 0) {
    return { status: 'success' } satisfies CountryActionState;
  }

  const headers = await getAuthenticatedRequestHeaders({ refreshIfNeeded: true });

  try {
    await api.patch(API_ROUTES.COUNTRY_ADMIN_BY_ID(countryId), body, { headers });
    revalidatePath(NAVIGATION.COUNTRIES);
    revalidatePath(NAVIGATION.COUNTRY_BY_ID(countryId));
    return { status: 'success' } satisfies CountryActionState;
  } catch (error) {
    const normalized = normalizeApiError(error);
    logApiError(normalized);
    return { status: 'error', error: normalized.data } satisfies CountryActionState;
  }
}
