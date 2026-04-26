/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { deleteCity } from '@/_actions/city/deleteCity';

type DeleteCityButtonProps = Readonly<{
  cityId: string;
  cityName: string;
}>;

export default function DeleteCityButton({
  cityId,
  cityName,
}: DeleteCityButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis?.window?.confirm(
        `Delete "${cityName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCity(cityId);
      if (result.success) {
        toast.success(`"${cityName}" deleted.`);
        if (globalThis?.window?.history.length > 1) {
          router.back();
        } else {
          router.push(NAVIGATION.CITIES);
        }
      } else {
        toast.error(result.error ?? 'We could not delete this city.');
      }
    });
  }, [cityId, cityName, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete City'}
    </Button>
  );
}
