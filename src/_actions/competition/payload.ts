/** @format */

import type {
  CompetitionActionState,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
} from '@/_types/competition';

const UNSET = Symbol('unset');
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function optionalNumber(value: string): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;

  return Number(value);
}

function normalizeDateInput(value: string): string | null {
  if (!value) return null;
  if (DATE_PATTERN.test(value)) return value;

  return null;
}

function formError(reason: string, message: string): CompetitionActionState {
  return {
    status: 'error',
    error: {
      reason,
      message,
      error: message,
    },
  };
}

function validateNullableUuid(
  value: string | null,
  reason: string,
  message: string,
): CompetitionActionState | null {
  if (!value || UUID_PATTERN.test(value)) return null;

  return formError(reason, message);
}

function partialRequired(value: string, original: string): string | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullable(
  value: string | null,
  original: string | null,
): string | null | typeof UNSET {
  return value === original ? UNSET : value;
}

function partialNullableNumber(
  value: number | null,
  original: number | null,
): number | null | typeof UNSET {
  return value === original ? UNSET : value;
}

type MutableUpdateCompetitionRequest = {
  -readonly [Key in keyof UpdateCompetitionRequest]?: UpdateCompetitionRequest[Key];
};

type NormalizedCompetitionFormInput = Readonly<{
  competitionTypeId: string;
  federationId: string | null;
  countryId: string | null;
  name: string;
  rawOriginalName: string;
  originalName: string | null;
  rawStartedOn: string;
  rawEndedOn: string;
  startedOn: string | null;
  endedOn: string | null;
  rawSortOrder: string;
  sortOrder: number | null;
  isPublic: boolean;
}>;

function normalizeCompetitionFormInput(formData: FormData): NormalizedCompetitionFormInput {
  const rawStartedOn = str(formData, 'startedOn');
  const rawEndedOn = str(formData, 'endedOn');
  const rawSortOrder = str(formData, 'sortOrder');
  const rawOriginalName = str(formData, 'originalName');

  return {
    competitionTypeId: str(formData, 'competitionTypeId'),
    federationId: optionalString(str(formData, 'federationId')),
    countryId: optionalString(str(formData, 'countryId')),
    name: str(formData, 'name'),
    rawOriginalName,
    originalName: optionalString(rawOriginalName),
    rawStartedOn,
    rawEndedOn,
    startedOn: normalizeDateInput(rawStartedOn),
    endedOn: normalizeDateInput(rawEndedOn),
    rawSortOrder,
    sortOrder: optionalNumber(rawSortOrder),
    isPublic: bool(formData, 'isPublic', false),
  };
}

function validateCompetitionInput(
  input: NormalizedCompetitionFormInput,
  originalDates?: Readonly<{
    startedOn: string | null;
    endedOn: string | null;
  }>,
): CompetitionActionState | null {
  if (!input.competitionTypeId) {
    return formError('COMPETITION_TYPE_ID_REQUIRED', 'Competition type is required.');
  }

  if (!UUID_PATTERN.test(input.competitionTypeId)) {
    return formError(
      'COMPETITION_INVALID_COMPETITION_TYPE_ID',
      'Select a valid competition type.',
    );
  }

  if (!input.name) {
    return formError('COMPETITION_NAME_REQUIRED', 'Competition name is required.');
  }

  if (input.name.length > 200) {
    return formError('COMPETITION_NAME_TOO_LONG', 'Competition name is too long.');
  }

  if (input.rawOriginalName && !input.originalName) {
    return formError(
      'COMPETITION_ORIGINAL_NAME_BLANK',
      'Original name cannot be blank when it is provided.',
    );
  }

  if (input.originalName && input.originalName.length > 200) {
    return formError(
      'COMPETITION_ORIGINAL_NAME_TOO_LONG',
      'Original name is too long.',
    );
  }

  const relationError = [
    validateNullableUuid(
      input.federationId,
      'COMPETITION_INVALID_FEDERATION_ID',
      'Select a valid federation.',
    ),
    validateNullableUuid(
      input.countryId,
      'COMPETITION_INVALID_COUNTRY_ID',
      'Select a valid country.',
    ),
  ].find(Boolean);

  if (relationError) {
    return relationError;
  }

  if (input.rawStartedOn && !input.startedOn) {
    return formError('COMPETITION_INVALID_STARTED_ON', 'Enter a valid start date.');
  }

  if (input.rawEndedOn && !input.endedOn) {
    return formError('COMPETITION_INVALID_ENDED_ON', 'Enter a valid end date.');
  }

  const effectiveStartedOn = input.startedOn ?? originalDates?.startedOn ?? null;
  const effectiveEndedOn = input.endedOn ?? originalDates?.endedOn ?? null;

  if (
    effectiveStartedOn &&
    effectiveEndedOn &&
    effectiveEndedOn < effectiveStartedOn
  ) {
    return formError(
      'COMPETITION_ENDED_ON_BEFORE_STARTED_ON',
      'End date cannot be before the start date.',
    );
  }

  if (input.rawSortOrder && input.sortOrder === null) {
    return formError('COMPETITION_INVALID_SORT_ORDER', 'Enter a valid sort order.');
  }

  return null;
}

export function buildCreateCompetitionBody(
  formData: FormData,
): {
  body?: CreateCompetitionRequest;
  error?: CompetitionActionState;
} {
  const input = normalizeCompetitionFormInput(formData);
  const validationError = validateCompetitionInput(input);
  if (validationError) {
    return { error: validationError };
  }

  return {
    body: {
      competition_type_id: input.competitionTypeId,
      federation_id: input.federationId,
      country_id: input.countryId,
      name: input.name,
      original_name: input.originalName,
      started_on: input.startedOn,
      ended_on: input.endedOn,
      sort_order: input.sortOrder,
      is_public: input.isPublic,
    },
  };
}

export function buildUpdateCompetitionBody(
  formData: FormData,
): {
  body?: UpdateCompetitionRequest;
  error?: CompetitionActionState;
  competitionId?: string;
} {
  const competitionId = str(formData, 'competitionId');
  if (!competitionId) {
    return {
      error: formError(
        'COMPETITION_ID_REQUIRED',
        'Competition identifier is required.',
      ),
    };
  }

  const input = normalizeCompetitionFormInput(formData);
  const validationError = validateCompetitionInput(input, {
    startedOn: optionalString(str(formData, 'original_startedOn')),
    endedOn: optionalString(str(formData, 'original_endedOn')),
  });
  if (validationError) {
    return { competitionId, error: validationError };
  }

  const body: MutableUpdateCompetitionRequest = {};
  const competitionTypeResult = partialNullable(
    input.competitionTypeId || null,
    optionalString(str(formData, 'original_competitionTypeId')),
  );
  const federationResult = partialNullable(
    input.federationId,
    optionalString(str(formData, 'original_federationId')),
  );
  const countryResult = partialNullable(
    input.countryId,
    optionalString(str(formData, 'original_countryId')),
  );
  const nameResult = partialRequired(input.name, str(formData, 'original_name'));
  const originalNameResult = partialNullable(
    input.originalName,
    optionalString(str(formData, 'original_originalName')),
  );
  const startedOnResult = partialNullable(
    input.startedOn,
    optionalString(str(formData, 'original_startedOn')),
  );
  const endedOnResult = partialNullable(
    input.endedOn,
    optionalString(str(formData, 'original_endedOn')),
  );
  const sortOrderResult = partialNullableNumber(
    input.sortOrder,
    optionalNumber(str(formData, 'original_sortOrder')),
  );
  const originalIsPublic = bool(formData, 'original_isPublic', false);

  if (competitionTypeResult !== UNSET) {
    if (!competitionTypeResult) {
      return {
        competitionId,
        error: formError(
          'COMPETITION_TYPE_ID_REQUIRED',
          'Competition type is required.',
        ),
      };
    }

    body.competition_type_id = competitionTypeResult;
  }
  if (federationResult !== UNSET) body.federation_id = federationResult;
  if (countryResult !== UNSET) body.country_id = countryResult;
  if (nameResult !== UNSET) body.name = nameResult;
  if (originalNameResult !== UNSET) body.original_name = originalNameResult;
  if (startedOnResult !== UNSET) body.started_on = startedOnResult;
  if (endedOnResult !== UNSET) body.ended_on = endedOnResult;
  if (sortOrderResult !== UNSET) body.sort_order = sortOrderResult;
  if (input.isPublic !== originalIsPublic) body.is_public = input.isPublic;

  return { competitionId, body };
}
