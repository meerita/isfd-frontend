/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { togglePersonActivation } from '@/_actions/person/togglePersonActivation';
import Button from '@/_components/forms/Button';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';
import type { PersonActionState } from '@/_types/person';

const INITIAL_STATE: PersonActionState = { status: 'idle' };

type PersonActivationToggleProps = Readonly<{
  personId: string;
  isPublic: boolean;
}>;

export default function PersonActivationToggle({
  personId,
  isPublic,
}: PersonActivationToggleProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [state, formAction, pending] = useActionState<
    PersonActionState,
    FormData
  >(togglePersonActivation, INITIAL_STATE);

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast.error(
        resolvePersonErrorMessage(
          state.error,
          dictionary.persons.errors,
          dictionary.common.unexpectedError,
        ),
      );
      return;
    }

    if (state.status === 'success') {
      router.refresh();
    }
  }, [
    dictionary.common.unexpectedError,
    dictionary.persons.errors,
    router,
    state.error,
    state.status,
  ]);

  const nextPublic = !isPublic;
  const label = pending
    ? isPublic
      ? dictionary.persons.detail.deactivating
      : dictionary.persons.detail.activating
    : isPublic
      ? dictionary.persons.detail.makeInactive
      : dictionary.persons.detail.makeActive;

  return (
    <form action={formAction}>
      <input type='hidden' name='person_id' value={personId} />
      <input type='hidden' name='is_public' value={String(nextPublic)} />
      <Button
        type='submit'
        disabled={pending}
        aria-busy={pending}
        variant='borderless'
      >
        {label}
      </Button>
    </form>
  );
}
