/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteClub } from '@/_actions/club/deleteClub';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveClubErrorMessage } from '@/_constants/clubErrorMessages';

type DeleteClubButtonProps = Readonly<{
  clubId: string;
  clubSlug: string;
  clubName: string;
}>;

export default function DeleteClubButton({
  clubId,
  clubSlug,
  clubName,
}: DeleteClubButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${clubName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteClub(clubId, clubSlug);

      if (result.success) {
        toast.success(`"${clubName}" deleted.`);
        router.push(NAVIGATION.CLUBS);
        router.refresh();
        return;
      }

      toast.error(
        resolveClubErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? 'We could not delete this club.',
                error: result.error ?? 'We could not delete this club.',
              }
            : undefined,
        ),
      );
    });
  }, [clubId, clubName, clubSlug, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete club'}
    </Button>
  );
}
