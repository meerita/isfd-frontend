/** @format */

// File: src/_components/flags/DeleteFeatureFlagForm.tsx
// Purpose: Feature flag delete confirmation form
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteFeatureFlag } from '@/_actions/flags/deleteFeatureFlag';
import NAVIGATION from '@/_constants/navigation';
import type { FeatureFlag } from '@/_types/featureFlag';
import { toast } from 'sonner';

interface DeleteFeatureFlagFormProps {
  flag: FeatureFlag;
}

export default function DeleteFeatureFlagForm({
  flag,
}: Readonly<DeleteFeatureFlagFormProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteFeatureFlag(flag.id);
      toast.success('Feature flag deleted');
      router.push(NAVIGATION.FLAGS);
      router.refresh();
    } catch {
      toast.error('Failed to delete feature flag');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p>
        <span>Are you sure you want to delete feature flag </span>
        <strong>{flag.key}</strong>
        <span>?</span>
      </p>
      <button onClick={handleDelete} disabled={loading}>
        Delete
      </button>
    </div>
  );
}
