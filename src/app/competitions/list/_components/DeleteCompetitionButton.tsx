/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCompetition } from '@/_actions/competition/deleteCompetition';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';

type DeleteCompetitionButtonProps = Readonly<{
  competitionId: string;
  competitionName: string;
}>;

export default function DeleteCompetitionButton({
  competitionId,
  competitionName,
}: DeleteCompetitionButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${competitionName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      logCompetitionDebug('DeleteCompetitionButton', 'request', {
        competitionId,
        competitionName,
      });
      const result = await deleteCompetition(competitionId);
      logCompetitionDebug('DeleteCompetitionButton', 'response', result);

      if (result.success) {
        toast.success(`"${competitionName}" deleted.`);
        router.push(NAVIGATION.COMPETITIONS_LIST);
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
  }, [competitionId, competitionName, isPending, router]);

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
