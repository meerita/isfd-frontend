/** @format */

import type { FederationActionState, FederationLevel } from '@/_types/federation';

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function bool(formData: FormData, key: string, fallback = false): boolean {
  const value = formData.get(key);
  if (typeof value !== 'string') return fallback;

  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === 'on' || normalized === '1';
}

function optionalString(value: string): string | null {
  return value.length > 0 ? value : null;
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

function isFutureDate(value: string): boolean {
  return value > new Date().toISOString().slice(0, 10);
}

function validateLevel(level: string): FederationLevel | null {
  if (level === 'WORLD' || level === 'CONTINENTAL' || level === 'NATIONAL') {
    return level;
  }

  return null;
}

function formError(
  reason: string,
  message: string,
  error: string,
): FederationActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
}

function validateDissolutionRules(
  foundationDate: string | null,
  dissolutionDate: string | null,
): FederationActionState | undefined {
  if (!dissolutionDate) return undefined;

  if (isFutureDate(dissolutionDate)) {
    return formError(
      'FEDERATION_DISSOLUTION_DATE_IN_FUTURE',
      'Dissolution date cannot be in the future.',
      'Dissolution date cannot be in the future.',
    );
  }

  if (foundationDate && dissolutionDate < foundationDate) {
    return formError(
      'FEDERATION_DISSOLUTION_DATE_BEFORE_FOUNDATION_DATE',
      'Dissolution date cannot be before foundation date.',
      'Dissolution date cannot be before foundation date.',
    );
  }

  return undefined;
}

export function buildCreateFederationBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: FederationActionState } {
  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'FEDERATION_NAME_REQUIRED',
        'Federation name is required.',
        'Federation name is required.',
      ),
    };
  }

  const federationLevel = validateLevel(str(formData, 'federationLevel'));
  if (!federationLevel) {
    return {
      error: formError(
        'FEDERATION_INVALID_LEVEL',
        'Federation level is required.',
        'Select a valid federation level.',
      ),
    };
  }

  const countryId = str(formData, 'countryId');
  const cityId = str(formData, 'cityId');
  if (cityId && !countryId) {
    return {
      error: formError(
        'FEDERATION_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
    };
  }

  const rawFoundationDate = str(formData, 'foundationDate');
  const foundationDate = normalizeDateInput(rawFoundationDate);
  if (rawFoundationDate && !foundationDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Foundation date must use YYYY-MM-DD.',
        'Enter a valid foundation date in YYYY-MM-DD format.',
      ),
    };
  }

  const rawDissolutionDate = str(formData, 'dissolutionDate');
  const dissolutionDate = normalizeDateInput(rawDissolutionDate);
  if (rawDissolutionDate && !dissolutionDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Dissolution date must use YYYY-MM-DD.',
        'Enter a valid dissolution date in YYYY-MM-DD format.',
      ),
    };
  }

  const isActive = bool(formData, 'isActive', false);
  const dissolutionError = validateDissolutionRules(foundationDate, dissolutionDate);
  if (dissolutionError) {
    return { error: dissolutionError };
  }

  const body: Record<string, unknown> = {
    name,
    federation_level: federationLevel,
    is_public: isActive,
  };

  const nativeName = optionalString(str(formData, 'nativeName'));
  const shortName = optionalString(str(formData, 'shortName'));
  const acronym = optionalString(str(formData, 'acronym'));
  const officialWebsiteUrl = optionalString(str(formData, 'officialWebsiteUrl'));
  const iconUrl = optionalString(str(formData, 'iconUrl'));
  const heroImageUrl = optionalString(str(formData, 'heroImageUrl'));

  if (nativeName !== null) body.native_name = nativeName;
  if (shortName !== null) body.short_name = shortName;
  if (acronym !== null) body.acronym = acronym;
  if (countryId) body.country_id = countryId;
  if (countryId && cityId) body.city_id = cityId;
  if (foundationDate !== null) body.foundation_date = foundationDate;
  if (dissolutionDate !== null) body.dissolution_date = dissolutionDate;
  if (officialWebsiteUrl !== null) body.official_website_url = officialWebsiteUrl;
  if (iconUrl !== null) body.icon_url = iconUrl;
  if (heroImageUrl !== null) body.hero_image_url = heroImageUrl;

  return { body };
}

export function buildUpdateFederationBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: FederationActionState; federationId?: string } {
  const federationId = str(formData, 'federationId');
  if (!federationId) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Missing federation identifier.',
        'Federation identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'FEDERATION_NAME_REQUIRED',
        'Federation name is required.',
        'Federation name is required.',
      ),
      federationId,
    };
  }

  const federationLevel = validateLevel(str(formData, 'federationLevel'));
  if (!federationLevel) {
    return {
      error: formError(
        'FEDERATION_INVALID_LEVEL',
        'Federation level is required.',
        'Select a valid federation level.',
      ),
      federationId,
    };
  }

  const countryId = optionalString(str(formData, 'countryId'));
  const cityId = optionalString(str(formData, 'cityId'));
  if (cityId && !countryId) {
    return {
      error: formError(
        'FEDERATION_CITY_REQUIRES_COUNTRY',
        'City requires country.',
        'Select a country before selecting a city.',
      ),
      federationId,
    };
  }

  const rawFoundationDate = str(formData, 'foundationDate');
  const foundationDate = normalizeDateInput(rawFoundationDate);
  if (rawFoundationDate && !foundationDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Foundation date must use YYYY-MM-DD.',
        'Enter a valid foundation date in YYYY-MM-DD format.',
      ),
      federationId,
    };
  }

  const rawDissolutionDate = str(formData, 'dissolutionDate');
  const dissolutionDate = normalizeDateInput(rawDissolutionDate);
  if (rawDissolutionDate && !dissolutionDate) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Dissolution date must use YYYY-MM-DD.',
        'Enter a valid dissolution date in YYYY-MM-DD format.',
      ),
      federationId,
    };
  }

  const isActive = bool(formData, 'isActive', false);
  const dissolutionError = validateDissolutionRules(foundationDate, dissolutionDate);
  if (dissolutionError) {
    return {
      error: dissolutionError,
      federationId,
    };
  }

  return {
    federationId,
    body: {
      name,
      native_name: optionalString(str(formData, 'nativeName')),
      short_name: optionalString(str(formData, 'shortName')),
      acronym: optionalString(str(formData, 'acronym')),
      federation_level: federationLevel,
      country_id: countryId,
      city_id: countryId ? cityId : null,
      foundation_date: rawFoundationDate ? foundationDate : null,
      dissolution_date: rawDissolutionDate ? dissolutionDate : null,
      official_website_url: optionalString(str(formData, 'officialWebsiteUrl')),
      icon_url: optionalString(str(formData, 'iconUrl')),
      hero_image_url: optionalString(str(formData, 'heroImageUrl')),
      is_public: isActive,
    },
  };
}
