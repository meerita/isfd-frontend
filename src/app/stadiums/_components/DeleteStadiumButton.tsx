/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteStadium } from '@/_actions/stadium/deleteStadium';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedStadiumErrorMessage } from '@/_constants/stadiumErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';

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
  const { dictionary } = useI18n();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `${dictionary.stadiums.delete.confirmTitle.replace('{name}', stadiumName)}\n\n${
          dictionary.stadiums.delete.confirmBody
        }`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteStadium(stadiumId);

      if (result.success) {
        toast.success(
          dictionary.stadiums.delete.success.replace('{name}', stadiumName),
        );
        router.push(NAVIGATION.STADIUMS);
        router.refresh();
        return;
      }

      toast.error(
        resolveLocalizedStadiumErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? dictionary.stadiums.delete.defaultError,
                error: result.error ?? dictionary.stadiums.delete.defaultError,
              }
            : undefined,
          dictionary.stadiums.errors,
          dictionary.common.unexpectedError,
        ),
      );
    });
  }, [dictionary, isPending, router, stadiumId, stadiumName]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending
        ? dictionary.stadiums.delete.pending
        : dictionary.stadiums.delete.action}
    </Button>
  );
}
