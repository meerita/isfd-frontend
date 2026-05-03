/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCompetitionType } from '@/_actions/competitionType/deleteCompetitionType';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import { logCompetitionDebug } from '@/_helpers/competitionDebug';

type DeleteCompetitionTypeButtonProps = Readonly<{
  competitionTypeId: string;
  competitionTypeName: string;
}>;

export default function DeleteCompetitionTypeButton({
  competitionTypeId,
  competitionTypeName,
}: DeleteCompetitionTypeButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${competitionTypeName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      logCompetitionDebug('DeleteCompetitionTypeButton', 'request', {
        competitionTypeId,
        competitionTypeName,
      });
      const result = await deleteCompetitionType(competitionTypeId);
      logCompetitionDebug('DeleteCompetitionTypeButton', 'response', result);

      if (result.success) {
        toast.success(`"${competitionTypeName}" deleted.`);
        router.push(NAVIGATION.COMPETITION_TYPES);
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
  }, [competitionTypeId, competitionTypeName, isPending, router]);

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
