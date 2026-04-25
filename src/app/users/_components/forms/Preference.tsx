/** @format */

'use client';
import { updateUserPreferences } from '@/_actions/user/updateUserPreferences';
import DoubleLineIconCheckbox from '@/_components/forms/DoubleLineIconCheckbox';
import DoubleLineIconSelect from '@/_components/forms/DoubleLineIconSelect';
import FieldSet from '@/_components/forms/Fieldset';
import Form from '@/_components/forms/Form';
import Grid from '@/_components/layout/Grid';
import DIMENSIONS from '@/_constants/Dimensions';
import LANGUAGES from '@/_constants/languages';
import { WEIGHTS } from '@/_constants/weights';
import MetricSystem from '@/_types/MetricSystem';
import type { User } from '@/_types/user';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type PreferencesState = Readonly<{
  dimensions: MetricSystem;
  weights: MetricSystem;
  language: string;
  theme: boolean;
}>;

const DEFAULT_PREFERENCES: PreferencesState = {
  dimensions: 'METRIC',
  weights: 'METRIC',
  language: 'en',
  theme: false,
};

const WEIGHTS_OPTIONS: ReadonlyArray<
  Readonly<{ value: string; label: string }>
> = WEIGHTS.map(function mapWeight(weight) {
  return {
    value: weight.name,
    label: weight.name,
  };
});

function isMetricSystem(value: string): value is MetricSystem {
  return value === 'METRIC' || value === 'IMPERIAL';
}

function normalizeMetricSystem(
  value: string | undefined,
  fallback: MetricSystem,
): MetricSystem {
  if (!value) {
    return fallback;
  }

  return isMetricSystem(value) ? value : fallback;
}

function buildInitialPreferences(user: User): PreferencesState {
  return {
    dimensions: normalizeMetricSystem(
      user.settings?.preferences?.dimensions,
      DEFAULT_PREFERENCES.dimensions,
    ),
    weights: normalizeMetricSystem(
      user.settings?.preferences?.weights,
      DEFAULT_PREFERENCES.weights,
    ),
    language:
      user.settings?.preferences?.language ?? DEFAULT_PREFERENCES.language,
    theme: user.settings?.preferences?.theme ?? DEFAULT_PREFERENCES.theme,
  };
}

export default function PreferencesForm({ user }: Readonly<{ user: User }>) {
  const [preferences, setPreferences] = useState<PreferencesState>(
    buildInitialPreferences(user),
  );
  const [, startTransition] = useTransition();

  const username = user.identity?.username?.trim() ?? '';
  const uuid = (user.uuid ?? '').trim();

  async function persistPreferences(
    nextPreferences: PreferencesState,
  ): Promise<void> {
    if (!uuid) {
      toast.error('Missing user identifier to update preferences.');
      return;
    }

    try {
      const result = await updateUserPreferences({
        uuid,
        username,
        preferences: nextPreferences,
      });

      if (result.status === 'error') {
        toast.error(result.error?.message ?? 'Failed to update preferences.', {
          description: result.error?.reason,
        });
        return;
      }

      setPreferences(nextPreferences);
      toast.success('Preferences updated successfully');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update preferences';
      toast.error(message, {
        description: 'Unexpected error while updating preferences.',
      });
    }
  }

  function queuePreferencesUpdate(nextPreferences: PreferencesState): void {
    function runPreferencesUpdate(): void {
      void persistPreferences(nextPreferences);
    }

    startTransition(runPreferencesUpdate);
  }

  function handleLanguageChange(value: string): void {
    const nextPreferences: PreferencesState = {
      ...preferences,
      language: value,
    };

    queuePreferencesUpdate(nextPreferences);
  }

  function handleMetricPreferenceChange(
    field: 'dimensions' | 'weights',
    value: string,
  ): void {
    if (!isMetricSystem(value)) {
      toast.error('Invalid metric system value.');
      return;
    }

    const nextPreferences: PreferencesState = {
      ...preferences,
      [field]: value,
    };

    queuePreferencesUpdate(nextPreferences);
  }

  function handleThemeChange(checked: boolean): void {
    const nextPreferences: PreferencesState = {
      ...preferences,
      theme: checked,
    };

    queuePreferencesUpdate(nextPreferences);
  }

  function handleDimensionsSelect(value: string): void {
    handleMetricPreferenceChange('dimensions', value);
  }

  function handleWeightsSelect(value: string): void {
    handleMetricPreferenceChange('weights', value);
  }

  function handleLanguageSelect(value: string): void {
    handleLanguageChange(value);
  }

  function handleThemeToggle(checked: boolean): void {
    handleThemeChange(checked);
  }

  return (
    <Form>
      <Grid gap={32} columns={2} alignItems='start'>
        <FieldSet>
          <DoubleLineIconSelect
            label='Dimensions'
            icon='dimensions'
            description='Distances, lengths and other dimension units'
            name='settings.preferences.dimensions'
            data={DIMENSIONS}
            value={preferences.dimensions}
            onChange={handleDimensionsSelect}
            line
          />
          <DoubleLineIconSelect
            label='Weights'
            icon='weight'
            description='Weights and mass units used in the app'
            name='settings.preferences.weights'
            data={WEIGHTS_OPTIONS}
            value={preferences.weights}
            onChange={handleWeightsSelect}
          />
        </FieldSet>
        <FieldSet>
          <DoubleLineIconSelect
            label='Language'
            icon='public'
            description='Language used in the UI of the app'
            name='settings.preferences.language'
            data={LANGUAGES}
            value={preferences.language}
            onChange={handleLanguageSelect}
            line
          />
          <DoubleLineIconCheckbox
            label='Dark Mode'
            icon='theme'
            description='Switch between light and dark mode'
            name='settings.preferences.theme'
            checked={preferences.theme}
            onCheckedChange={handleThemeToggle}
          />
        </FieldSet>
      </Grid>
    </Form>
  );
}
