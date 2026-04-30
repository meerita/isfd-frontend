/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCity } from '@/_actions/city/deleteCity';
import Button from '@/_components/forms/Button';
import { resolveCityErrorMessage } from '@/_constants/cityErrorMessages';
import NAVIGATION from '@/_constants/navigation';

type DeleteCityButtonProps = Readonly<{
  cityId: string;
  cityName: string;
  countryId?: string | null;
}>;

export default function DeleteCityButton({
  cityId,
  cityName,
  countryId = null,
}: DeleteCityButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${cityName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCity(cityId, countryId);

      if (result.success) {
        toast.success(`"${cityName}" deleted.`);
        router.push(NAVIGATION.CITIES);
        router.refresh();
        return;
      }

      toast.error(
        resolveCityErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? 'We could not delete this city.',
                error: result.error ?? 'We could not delete this city.',
              }
            : undefined,
        ),
      );
    });
  }, [cityId, cityName, countryId, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete city'}
    </Button>
  );
}
