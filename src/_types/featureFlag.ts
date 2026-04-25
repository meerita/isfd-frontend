/** @format */

// File: src/_types/featureFlag.ts
// Purpose: Feature flag types
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

export type FeatureFlagStatus = 'ACTIVE' | 'INACTIVE';

export type FeatureFlagPlatform = 'IOS' | 'ANDROID' | 'WEB';

export interface FeatureFlagRule {
  readonly priority: number;
  readonly enabled: boolean;
  readonly platforms: ReadonlyArray<FeatureFlagPlatform>;
  readonly countries: ReadonlyArray<string>;
  readonly excludedCountries: ReadonlyArray<string>;
}

export interface FeatureFlagValue {
  readonly variant?: string;
  readonly minVersion?: string;
}

export interface FeatureFlag {
  readonly id: string;
  readonly key: string;
  readonly value: FeatureFlagValue;
  readonly status: FeatureFlagStatus;
  readonly defaultEnabled: boolean;
  readonly rules: ReadonlyArray<FeatureFlagRule>;
  readonly startAt: string | null;
  readonly endAt: string | null;
  readonly description?: string;
}

export interface FeatureFlagCreateDTO {
  readonly key: string;
  readonly value: FeatureFlagValue;
  readonly status: FeatureFlagStatus;
  readonly defaultEnabled: boolean;
  readonly rules: ReadonlyArray<FeatureFlagRule>;
  readonly startAt?: string | null;
  readonly endAt?: string | null;
  readonly description?: string;
}

export interface FeatureFlagUpdateDTO {
  readonly value?: FeatureFlagValue;
  readonly status?: FeatureFlagStatus;
  readonly defaultEnabled?: boolean;
  readonly rules?: ReadonlyArray<FeatureFlagRule>;
  readonly startAt?: string | null;
  readonly endAt?: string | null;
  readonly description?: string;
}
