/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deletePerson } from '@/_actions/person/deletePerson';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';

type DeletePersonButtonProps = Readonly<{
  personId: string;
  personName: string;
}>;

export default function DeletePersonButton({
  personId,
  personName,
}: DeletePersonButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${personName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePerson(personId);

      if (result.success) {
        toast.success(`"${personName}" deleted.`);
        router.push(NAVIGATION.PERSONS);
        router.refresh();
        return;
      }

      toast.error(
        resolvePersonErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? 'We could not delete this person.',
                error: result.error ?? 'We could not delete this person.',
              }
            : undefined,
        ),
      );
    });
  }, [isPending, personId, personName, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete person'}
    </Button>
  );
}
