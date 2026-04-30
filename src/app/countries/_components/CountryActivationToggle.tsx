/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/_components/forms/Button';
import { toggleCountryActivation } from '@/_actions/country/toggleCountryActivation';
import { resolveCountryErrorMessage } from '@/_constants/countryErrorMessages';
import type { CountryActionState } from '@/_types/country';

const INITIAL_STATE: CountryActionState = { status: 'idle' };

type CountryActivationToggleProps = Readonly<{
  countryId: string;
  isActive: boolean;
}>;

export default function CountryActivationToggle({
  countryId,
  isActive,
}: CountryActivationToggleProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CountryActionState, FormData>(
    toggleCountryActivation,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(resolveCountryErrorMessage(state.error));
      return;
    }

    if (state.status === 'success') {
      router.refresh();
    }
  }, [router, state.error, state.status]);

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
      <input type='hidden' name='countryId' value={countryId} />
      <input type='hidden' name='isActive' value={nextActive.toString()} />
      <Button
        type='submit'
        disabled={pending}
        aria-busy={pending}
        variant='borderless'
        kind={isActive ? 'secondary' : 'primary'}
      >
        {label}
      </Button>
    </form>
  );
}
