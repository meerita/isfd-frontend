/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteStadium } from '@/_actions/stadium/deleteStadium';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';

type DeleteStadiumButtonProps = Readonly<{
  stadiumId: string;
  stadiumName: string;
}>;

export default function DeleteStadiumButton({
  stadiumId,
  stadiumName,
}: DeleteStadiumButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${stadiumName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteStadium(stadiumId);

      if (result.success) {
        toast.success(`"${stadiumName}" deleted.`);
        router.push(NAVIGATION.STADIUMS);
        router.refresh();
        return;
      }

      toast.error(
        resolveStadiumErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? 'We could not delete this stadium.',
                error: result.error ?? 'We could not delete this stadium.',
              }
            : undefined,
        ),
      );
    });
  }, [isPending, router, stadiumId, stadiumName]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete stadium'}
    </Button>
  );
}
