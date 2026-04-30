/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/_components/forms/Button';
import { toggleCityActivation } from '@/_actions/city/toggleCityActivation';
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import type { CityActionState } from '@/_types/city';

const INITIAL_STATE: CityActionState = { status: 'idle' };

type CityActivationToggleProps = Readonly<{
  cityId: string;
  isActive: boolean;
}>;

export default function CityActivationToggle({
  cityId,
  isActive,
}: CityActivationToggleProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    CityActionState,
    FormData
  >(toggleCityActivation, INITIAL_STATE);

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(resolveCityErrorMessage(state.error));
      return;
    }
    if (state.status === 'success') {
      router.refresh();
    }
  }, [state.error, state.status, router]);

  const nextActive = !isActive;
  const label = pending
    ? isActive
      ? 'Deactivating...'
      : 'Activating...'
    : isActive
      ? 'Deactivate'
      : 'Activate';

  return (
    <form action={formAction}>
      <input type='hidden' name='cityId' value={cityId} />
      <input type='hidden' name='isActive' value={nextActive.toString()} />
      <Button type='submit' disabled={pending} aria-busy={pending}>
        {label}
      </Button>
    </form>
  );
}
