/** @format */

// File: src/_components/flags/FeatureFlagForm.tsx
// Purpose: Shared create/edit form for feature flags using app form primitives
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use client';

import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type ComponentProps,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';

import { createFeatureFlag } from '@/_actions/flags/createFeatureFlag';
import { deleteFeatureFlag } from '@/_actions/flags/deleteFeatureFlag';
import { updateFeatureFlag } from '@/_actions/flags/updateFeatureFlag';
import Button from '@/_components/forms/Button';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextArea from '@/_components/forms/TextArea';
import TextInput from '@/_components/forms/TextInput';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import {
  FEATURE_FLAG_PLATFORM_OPTIONS,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_OPTIONS,
} from '@/_constants/featureFlags';
import NAVIGATION from '@/_constants/navigation';
import { normalizeApiError } from '@/_lib/apiError';
import type {
  FeatureFlag,
  FeatureFlagCreateDTO,
  FeatureFlagPlatform,
  FeatureFlagRule,
  FeatureFlagStatus,
  FeatureFlagUpdateDTO,
} from '@/_types/featureFlag';

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<'form'>['onSubmit']>
>[0];

type FeatureFlagFormValues = Readonly<{
  key: string;
  variant: string;
  minVersion: string;
  status: FeatureFlagStatus;
  defaultEnabled: boolean;
  description: string;
  startAt: string;
  endAt: string;
  rulePriority: string;
  ruleEnabled: boolean;
  rulePlatforms: string;
  ruleCountries: string;
  ruleExcludedCountries: string;
}>;

type FeatureFlagFormProps = Readonly<{
  flag?: FeatureFlag | null;
  edit?: boolean;
}>;

type FeatureFlagFormErrors = Readonly<{
  key?: string;
  value?: string;
  rulePriority?: string;
  rulePlatforms?: string;
  ruleCountries?: string;
  ruleExcludedCountries?: string;
  endAt?: string;
}>;

function splitCommaSeparatedValues(value: string): string[] {
  return value
    .split(',')
    .map(function normalizeItem(item) {
      return item.trim();
    })
    .filter(Boolean);
}

function joinCommaSeparatedValues(values?: ReadonlyArray<string>): string {
  return (values ?? []).join(', ');
}

function normalizeUniqueValues(
  values: ReadonlyArray<string>,
  uppercase = false,
): string[] {
  const normalizedValues = values
    .map(function normalizeValue(value) {
      const trimmedValue = value.trim();

      return uppercase ? trimmedValue.toUpperCase() : trimmedValue;
    })
    .filter(Boolean);

  return Array.from(new Set(normalizedValues));
}

function isFeatureFlagPlatform(value: string): value is FeatureFlagPlatform {
  return FEATURE_FLAG_PLATFORM_OPTIONS.some(function matchesPlatform(option) {
    return option.value === value;
  });
}

function splitPlatformValues(value: string): FeatureFlagPlatform[] {
  return normalizeUniqueValues(splitCommaSeparatedValues(value), true).filter(
    isFeatureFlagPlatform,
  );
}

function splitCountryValues(value: string): string[] {
  return normalizeUniqueValues(splitCommaSeparatedValues(value), true);
}

function getInvalidCountryCodes(value: string): string[] {
  return splitCountryValues(value).filter(function isInvalidCountryCode(code) {
    return !/^[A-Z]{2}$/.test(code);
  });
}

function getInvalidPlatforms(value: string): string[] {
  return normalizeUniqueValues(splitCommaSeparatedValues(value), true).filter(
    function isInvalidPlatform(platform) {
      return !isFeatureFlagPlatform(platform);
    },
  );
}

function formatDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function buildRule(values: FeatureFlagFormValues): FeatureFlagRule {
  return {
    priority: Number(values.rulePriority) || 1,
    enabled: values.ruleEnabled,
    platforms: splitPlatformValues(values.rulePlatforms),
    countries: splitCountryValues(values.ruleCountries),
    excludedCountries: splitCountryValues(values.ruleExcludedCountries),
  } satisfies FeatureFlagRule;
}

function buildValuePayload(
  values: FeatureFlagFormValues,
): FeatureFlagCreateDTO['value'] {
  const variant = values.variant.trim();
  const minVersion = values.minVersion.trim();

  return {
    ...(variant ? { variant } : {}),
    ...(minVersion ? { minVersion } : {}),
  };
}

function validateFormValues(
  values: FeatureFlagFormValues,
): FeatureFlagFormErrors {
  const errors: Record<string, string> = {};

  if (!values.key.trim()) {
    errors.key = 'Flag key is required.';
  }

  if (Object.keys(buildValuePayload(values)).length === 0) {
    errors.value =
      'Provide at least one value field: variant or minimum version.';
  }

  if (!values.rulePriority.trim()) {
    errors.rulePriority = 'Priority is required.';
  } else if (!/^[1-9]\d*$/.test(values.rulePriority.trim())) {
    errors.rulePriority = 'Priority must be a positive integer.';
  }

  const invalidPlatforms = getInvalidPlatforms(values.rulePlatforms);
  if (invalidPlatforms.length > 0) {
    errors.rulePlatforms = `Unsupported platforms: ${invalidPlatforms.join(', ')}.`;
  } else if (buildRule(values).platforms.length === 0) {
    errors.rulePlatforms = 'Select at least one platform for the primary rule.';
  }

  const invalidCountries = getInvalidCountryCodes(values.ruleCountries);
  if (invalidCountries.length > 0) {
    errors.ruleCountries = `Countries must use ISO codes like ES or PT. Invalid values: ${invalidCountries.join(', ')}.`;
  }

  const invalidExcludedCountries = getInvalidCountryCodes(
    values.ruleExcludedCountries,
  );
  if (invalidExcludedCountries.length > 0) {
    errors.ruleExcludedCountries = `Excluded countries must use ISO codes like ES or PT. Invalid values: ${invalidExcludedCountries.join(', ')}.`;
  }

  if (values.startAt && values.endAt) {
    const startAt = new Date(values.startAt);
    const endAt = new Date(values.endAt);

    if (startAt.getTime() > endAt.getTime()) {
      errors.endAt = 'End date must be after the start date.';
    }
  }

  return errors;
}

function getFirstError(errors: FeatureFlagFormErrors): string | null {
  const firstError = Object.values(errors).find(Boolean);

  return firstError ?? null;
}

function buildInitialValues(flag?: FeatureFlag | null): FeatureFlagFormValues {
  const primaryRule = flag?.rules[0];

  return {
    key: flag?.key ?? '',
    variant: flag?.value.variant ?? '',
    minVersion: flag?.value.minVersion ?? '',
    status: flag?.status ?? FEATURE_FLAG_STATUS.ACTIVE,
    defaultEnabled: flag?.defaultEnabled ?? false,
    description: flag?.description ?? '',
    startAt: formatDateTimeLocalValue(flag?.startAt),
    endAt: formatDateTimeLocalValue(flag?.endAt),
    rulePriority: String(primaryRule?.priority ?? 1),
    ruleEnabled: primaryRule?.enabled ?? true,
    rulePlatforms: joinCommaSeparatedValues(primaryRule?.platforms),
    ruleCountries: joinCommaSeparatedValues(primaryRule?.countries),
    ruleExcludedCountries: joinCommaSeparatedValues(
      primaryRule?.excludedCountries,
    ),
  } satisfies FeatureFlagFormValues;
}

function buildCreatePayload(
  values: FeatureFlagFormValues,
): FeatureFlagCreateDTO {
  return {
    key: values.key.trim(),
    value: buildValuePayload(values),
    status: values.status,
    defaultEnabled: values.defaultEnabled,
    rules: [buildRule(values)],
    startAt: toIsoDateTime(values.startAt),
    endAt: toIsoDateTime(values.endAt),
    description: values.description.trim() || undefined,
  } satisfies FeatureFlagCreateDTO;
}

function buildUpdatePayload(
  values: FeatureFlagFormValues,
): FeatureFlagUpdateDTO {
  return {
    value: buildValuePayload(values),
    status: values.status,
    defaultEnabled: values.defaultEnabled,
    rules: [buildRule(values)],
    startAt: toIsoDateTime(values.startAt),
    endAt: toIsoDateTime(values.endAt),
    description: values.description.trim() || undefined,
  } satisfies FeatureFlagUpdateDTO;
}

export default function FeatureFlagForm({
  flag,
  edit = false,
}: FeatureFlagFormProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [formValues, setFormValues] = useState<FeatureFlagFormValues>(
    buildInitialValues(flag),
  );
  const [errors, setErrors] = useState<FeatureFlagFormErrors>({});
  const [pending, setPending] = useState(false);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { currentTarget } = event;
    const nextValue =
      currentTarget instanceof HTMLInputElement &&
      currentTarget.type === 'checkbox'
        ? currentTarget.checked
        : currentTarget.value;

    setFormValues(function updateValues(previousValues) {
      return {
        ...previousValues,
        [currentTarget.name]: nextValue,
      };
    });

    setErrors(function clearFieldError(previousErrors) {
      return {
        ...previousErrors,
        [currentTarget.name]: undefined,
        ...(currentTarget.name === 'variant' ||
        currentTarget.name === 'minVersion'
          ? { value: undefined }
          : {}),
        ...(currentTarget.name === 'startAt' || currentTarget.name === 'endAt'
          ? { endAt: undefined }
          : {}),
      };
    });
  }

  function handleCancel() {
    if (globalThis?.window?.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.FLAGS);
  }

  function handleDelete() {
    if (!edit || !flag || pending || isDeleting) {
      return;
    }

    const confirmationMessage = `Are you sure you want to delete ${flag.key}? This action cannot be undone.`;
    const confirmed = globalThis?.window?.confirm(confirmationMessage) ?? false;

    if (!confirmed) {
      return;
    }

    startDeleteTransition(function startDeletion() {
      void (async function performDeletion() {
        try {
          await deleteFeatureFlag(flag.id);
          toast.success('Feature flag deleted successfully.');
          router.replace(NAVIGATION.FLAGS);
        } catch (error) {
          const normalizedError = normalizeApiError(error);
          toast.error(
            normalizedError.data.message ||
              'We could not delete the feature flag.',
          );
        }
      })();
    });
  }

  async function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    const validationErrors = validateFormValues(formValues);
    const firstError = getFirstError(validationErrors);

    if (firstError) {
      setErrors(validationErrors);
      toast.error(firstError);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      if (edit && flag) {
        await updateFeatureFlag(flag.id, buildUpdatePayload(formValues));
        toast.success('Feature flag updated successfully.');
      } else {
        await createFeatureFlag(buildCreatePayload(formValues));
        toast.success('Feature flag created successfully.');
      }

      handleCancel();
      router.refresh();
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toast.error(
        normalizedError.data.message || 'We could not save the feature flag.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Flag key'
              name='key'
              placeholder='NEW_HOME_VARIANT'
              value={formValues.key}
              onChange={handleChange}
              disabled={pending || edit}
              error={Boolean(errors.key)}
              helperText={errors.key}
              required
            />
            <TextInput
              label='Variant'
              name='variant'
              placeholder='B'
              value={formValues.variant}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.value)}
              helperText={errors.value}
            />
            <TextInput
              label='Minimum version'
              name='minVersion'
              placeholder='2.4.0'
              value={formValues.minVersion}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.value)}
              helperText={errors.value}
            />
            <Select
              label='Status'
              name='status'
              value={formValues.status}
              onChange={handleChange}
              disabled={pending}
              required
            >
              {FEATURE_FLAG_STATUS_OPTIONS.map(
                function renderStatusOption(option) {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                },
              )}
            </Select>
            <TextInput
              label='Start at'
              name='startAt'
              type='datetime-local'
              value={formValues.startAt}
              onChange={handleChange}
              disabled={pending}
            />
            <TextInput
              label='End at'
              name='endAt'
              type='datetime-local'
              value={formValues.endAt}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.endAt)}
              helperText={errors.endAt}
            />
            <TextArea
              label='Description'
              name='description'
              placeholder='Explain the rollout intent and expected behavior.'
              value={formValues.description}
              onChange={handleChange}
              className='grid-column--2'
              rows={4}
              disabled={pending}
            />
          </Grid>

          <CheckBoxInput
            name='defaultEnabled'
            label='Enabled by default'
            defaultChecked={formValues.defaultEnabled}
            onChange={handleChange}
            disabled={pending}
            value='true'
          />

          <ButtonGroup gap={4} className='margin-top--24'>
            <Button type='submit' disabled={pending} aria-busy={pending}>
              {pending
                ? edit
                  ? 'Updating feature flag...'
                  : 'Creating feature flag...'
                : edit
                  ? 'Update feature flag'
                  : 'Create feature flag'}
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              variant='borderless'
              kind='primary'
              disabled={pending || isDeleting}
            >
              Cancel
            </Button>
            {edit && flag ? (
              <Button
                type='button'
                onClick={handleDelete}
                variant='borderless'
                kind='primary'
                icon='remove'
                disabled={pending || isDeleting}
                aria-busy={isDeleting}
              >
                {isDeleting
                  ? 'Deleting feature flag...'
                  : 'Delete feature flag'}
              </Button>
            ) : null}
          </ButtonGroup>
        </Section>

        <Section>
          <Grid gap={8}>
            <Title size='small'>Primary rule</Title>
            <Text size='small' color='gray'>
              Use comma-separated values for platforms and countries. Example:
              {` `}
              {FEATURE_FLAG_PLATFORM_OPTIONS.map(function joinPlatform(option) {
                return option.value;
              }).join(', ')}
            </Text>
          </Grid>

          <Grid gap={8} columns={2}>
            <TextInput
              label='Priority'
              name='rulePriority'
              type='number'
              min='1'
              step='1'
              value={formValues.rulePriority}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.rulePriority)}
              helperText={errors.rulePriority}
              required
            />
            <TextInput
              label='Platforms'
              name='rulePlatforms'
              placeholder='IOS, ANDROID'
              value={formValues.rulePlatforms}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.rulePlatforms)}
              helperText={errors.rulePlatforms}
              required
            />
            <TextInput
              label='Countries'
              name='ruleCountries'
              placeholder='ES, PT'
              value={formValues.ruleCountries}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.ruleCountries)}
              helperText={errors.ruleCountries}
            />
            <TextInput
              label='Excluded countries'
              name='ruleExcludedCountries'
              placeholder='FR'
              value={formValues.ruleExcludedCountries}
              onChange={handleChange}
              disabled={pending}
              error={Boolean(errors.ruleExcludedCountries)}
              helperText={errors.ruleExcludedCountries}
            />
          </Grid>

          <CheckBoxInput
            name='ruleEnabled'
            label='Rule enabled'
            defaultChecked={formValues.ruleEnabled}
            onChange={handleChange}
            disabled={pending}
            value='true'
          />
        </Section>
      </Grid>
    </Form>
  );
}
