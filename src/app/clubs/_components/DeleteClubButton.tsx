/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteClub } from '@/_actions/club/deleteClub';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedClubErrorMessage } from '@/_constants/clubErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';

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
  const { dictionary } = useI18n();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `${dictionary.clubs.delete.confirmTitle.replace('{name}', clubName)}\n\n${
          dictionary.clubs.delete.confirmBody
        }`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteClub(clubId, clubSlug);

      if (result.success) {
        toast.success(dictionary.clubs.delete.success.replace('{name}', clubName));
        router.push(NAVIGATION.CLUBS);
        router.refresh();
        return;
      }

      toast.error(
        resolveLocalizedClubErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? dictionary.clubs.delete.defaultError,
                error: result.error ?? dictionary.clubs.delete.defaultError,
              }
            : undefined,
          dictionary.clubs.errors,
          dictionary.common.unexpectedError,
        ),
      );
    });
  }, [clubId, clubName, clubSlug, dictionary, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? dictionary.clubs.delete.pending : dictionary.clubs.delete.action}
    </Button>
  );
}
