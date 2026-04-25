/** @format */

// File: src/_components/flags/EditFeatureFlagForm.tsx
// Purpose: Wrapper for the shared feature flag edit form
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import type { FeatureFlag } from '@/_types/featureFlag';

import FeatureFlagForm from './FeatureFlagForm';

interface EditFeatureFlagFormProps {
  flag: FeatureFlag;
}

export default function EditFeatureFlagForm({
  flag,
}: Readonly<EditFeatureFlagFormProps>) {
  return <FeatureFlagForm flag={flag} edit />;
}
