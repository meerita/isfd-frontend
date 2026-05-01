/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteSeason } from '@/_actions/season/deleteSeason';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';

type DeleteSeasonButtonProps = Readonly<{
  seasonId: string;
  seasonName: string;
}>;

export default function DeleteSeasonButton({
  seasonId,
  seasonName,
}: DeleteSeasonButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${seasonName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteSeason(seasonId);

      if (result.success) {
        toast.success(`"${seasonName}" deleted.`);
        router.push(NAVIGATION.COMPETITION_SEASONS);
        router.refresh();
        return;
      }

      toast.error(
        resolveCompetitionAdminErrorMessage(
          result.reason && result.error
            ? {
                reason: result.reason,
                message: result.error,
                error: result.error,
              }
            : undefined,
        ),
      );
    });
  }, [isPending, router, seasonId, seasonName]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
