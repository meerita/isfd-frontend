/** @format */

import { describe, expect, test } from 'bun:test';

import { resolveLocalizedFederationErrorMessage } from '@/_constants/federationErrorMessages';
import es from '@/_i18n/messages/es';
import {
  buildCreateFederationBody,
  buildUpdateFederationBody,
} from './payload';

function buildFormData(
  values: Readonly<Record<string, string>>,
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe('federation payload builders', () => {
  test('create omits description and supports empty dissolution date', () => {
    const { body, error } = buildCreateFederationBody(
      buildFormData({
        name: 'UEFA',
        federationLevel: 'CONTINENTAL',
        isActive: 'true',
      }),
    );

    expect(error).toBeUndefined();
    expect(body).toBeDefined();
    expect(body?.name).toBe('UEFA');
    expect(body?.is_public).toBe(true);
    expect(body).not.toHaveProperty('description');
    expect(body).not.toHaveProperty('dissolution_date');
  });

  test('update sends dissolution date when provided', () => {
    const { body, error } = buildUpdateFederationBody(
      buildFormData({
        federationId: 'fed-1',
        name: 'UEFA',
        federationLevel: 'CONTINENTAL',
        dissolutionDate: '2024-06-01',
      }),
    );

    expect(error).toBeUndefined();
    expect(body?.dissolution_date).toBe('2024-06-01');
    expect(body).not.toHaveProperty('description');
  });

  test('update clears dissolution date with null when the field is emptied', () => {
    const { body, error } = buildUpdateFederationBody(
      buildFormData({
        federationId: 'fed-1',
        name: 'UEFA',
        federationLevel: 'CONTINENTAL',
        dissolutionDate: '',
      }),
    );

    expect(error).toBeUndefined();
    expect(body?.dissolution_date).toBeNull();
  });

  test('update allows active dissolved federations', () => {
    const { body, error } = buildUpdateFederationBody(
      buildFormData({
        federationId: 'fed-1',
        name: 'UEFA',
        federationLevel: 'CONTINENTAL',
        dissolutionDate: '2024-06-01',
        isActive: 'true',
      }),
    );

    expect(error).toBeUndefined();
    expect(body?.is_public).toBe(true);
  });
});

describe('federation error messages', () => {
  test('resolves the new dissolution error messages in spanish', () => {
    expect(
      resolveLocalizedFederationErrorMessage(
        { reason: 'FEDERATION_DISSOLUTION_DATE_IN_FUTURE' },
        es.federations.errors,
      ),
    ).toBe('La fecha de disolución no puede estar en el futuro.');

    expect(
      resolveLocalizedFederationErrorMessage(
        {
          reason: 'FEDERATION_DISSOLUTION_DATE_BEFORE_FOUNDATION_DATE',
        },
        es.federations.errors,
      ),
    ).toBe(
      'La fecha de disolución no puede ser anterior a la fecha de fundación.',
    );

  });
});
