/** @format */

import type { BrandActionState } from '@/_types/brand';

const UNSET = Symbol('unset');

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

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formError(
  reason: string,
  message: string,
  error: string,
): BrandActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error,
    },
  };
}

function validateNullableUrl(
  value: string | null,
  reason: string,
  message: string,
): BrandActionState | null {
  if (!value || isValidHttpUrl(value)) return null;
  return formError(reason, message, message);
}

function partialNullable(
  value: string | null,
  original: string | null,
): string | null | typeof UNSET {
  if (value === original) return UNSET;
  return value;
}

function partialRequired(
  value: string,
  original: string,
): string | typeof UNSET {
  if (value === original) return UNSET;
  return value;
}

export function buildCreateBrandBody(
  formData: FormData,
): { body?: Record<string, unknown>; error?: BrandActionState } {
  const name = str(formData, 'name');
  if (!name) {
    return {
      error: formError(
        'BRAND_NAME_REQUIRED',
        'Brand name is required.',
        'Brand name is required.',
      ),
    };
  }

  const websiteUrl = optionalString(str(formData, 'websiteUrl'));
  const iconImageUrl = optionalString(str(formData, 'iconImageUrl'));
  const detailImageUrl = optionalString(str(formData, 'detailImageUrl'));

  const validationError =
    validateNullableUrl(
      websiteUrl,
      'BRAND_INVALID_WEBSITE_URL',
      'Enter a valid website URL.',
    ) ??
    validateNullableUrl(
      iconImageUrl,
      'BRAND_INVALID_ICON_IMAGE_URL',
      'Enter a valid icon image URL.',
    ) ??
    validateNullableUrl(
      detailImageUrl,
      'BRAND_INVALID_DETAIL_IMAGE_URL',
      'Enter a valid detail image URL.',
    );

  if (validationError) {
    return { error: validationError };
  }

  const body: Record<string, unknown> = {
    name,
    is_public: bool(formData, 'isActive', true),
  };

  if (websiteUrl !== null) body.website_url = websiteUrl;
  if (iconImageUrl !== null) body.icon_image_url = iconImageUrl;
  if (detailImageUrl !== null) body.detail_image_url = detailImageUrl;

  return { body };
}

export function buildUpdateBrandBody(formData: FormData): {
  body?: Record<string, unknown>;
  error?: BrandActionState;
  brandId?: string;
} {
  const brandId = str(formData, 'brandId');
  if (!brandId) {
    return {
      error: formError(
        'FORM_VALIDATION_ERROR',
        'Missing brand identifier.',
        'Brand identifier is required to update the record.',
      ),
    };
  }

  const name = str(formData, 'name');
  const originalName = str(formData, 'original_name');
  const nameResult = partialRequired(name, originalName);
  if (nameResult !== UNSET && !nameResult) {
    return {
      brandId,
      error: formError(
        'BRAND_NAME_REQUIRED',
        'Brand name is required.',
        'Brand name is required.',
      ),
    };
  }

  const websiteUrl = optionalString(str(formData, 'websiteUrl'));
  const iconImageUrl = optionalString(str(formData, 'iconImageUrl'));
  const detailImageUrl = optionalString(str(formData, 'detailImageUrl'));
  const originalWebsiteUrl = optionalString(str(formData, 'original_websiteUrl'));
  const originalIconImageUrl = optionalString(
    str(formData, 'original_iconImageUrl'),
  );
  const originalDetailImageUrl = optionalString(
    str(formData, 'original_detailImageUrl'),
  );

  const websiteUrlResult = partialNullable(websiteUrl, originalWebsiteUrl);
  const iconImageUrlResult = partialNullable(iconImageUrl, originalIconImageUrl);
  const detailImageUrlResult = partialNullable(
    detailImageUrl,
    originalDetailImageUrl,
  );

  const validationError =
    (websiteUrlResult !== UNSET
      ? validateNullableUrl(
          websiteUrl,
          'BRAND_INVALID_WEBSITE_URL',
          'Enter a valid website URL.',
        )
      : null) ??
    (iconImageUrlResult !== UNSET
      ? validateNullableUrl(
          iconImageUrl,
          'BRAND_INVALID_ICON_IMAGE_URL',
          'Enter a valid icon image URL.',
        )
      : null) ??
    (detailImageUrlResult !== UNSET
      ? validateNullableUrl(
          detailImageUrl,
          'BRAND_INVALID_DETAIL_IMAGE_URL',
          'Enter a valid detail image URL.',
        )
      : null);

  if (validationError) {
    return { brandId, error: validationError };
  }

  const body: Record<string, unknown> = {};

  if (nameResult !== UNSET) {
    body.name = nameResult;
  }

  if (websiteUrlResult !== UNSET) {
    body.website_url = websiteUrlResult;
  }

  if (iconImageUrlResult !== UNSET) {
    body.icon_image_url = iconImageUrlResult;
  }

  if (detailImageUrlResult !== UNSET) {
    body.detail_image_url = detailImageUrlResult;
  }

  const isActive = bool(formData, 'isActive', false);
  const originalIsActive = bool(formData, 'original_isActive', false);
  if (isActive !== originalIsActive) {
    body.is_public = isActive;
  }

  return { brandId, body };
}
