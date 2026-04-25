/** @format */

'use client';
// File: src/app/cities/_components/DeleteCityButton.tsx
// Purpose: Client button that confirms and deletes a city
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { deleteCity } from '@/_actions/city/deleteCity';

interface DeleteCityButtonProps {
  cityId: string;
  cityName: string;
}

export default function DeleteCityButton({
  cityId,
  cityName,
}: Readonly<DeleteCityButtonProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigateBack = useCallback(() => {
    if (globalThis?.window?.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.CITIES);
  }, [router]);

  const handleDelete = useCallback(() => {
    if (isPending) {
      return;
    }

    const confirmationMessage = `Are you sure you want to delete ${cityName}? Once this city vanishes from the atlas, explorers will have no way back.`;
    const confirmed = globalThis?.window?.confirm(confirmationMessage) ?? false;

    if (confirmed) {
      const performDeletion = async () => {
        try {
          const result = await deleteCity(cityId);

          if (result.success) {
            toast.success(`${cityName} has been erased from the map.`);
            navigateBack();
            return;
          }

          toast.error(result.error ?? 'We could not delete this city.');
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'We could not delete this city.';
          toast.error(message);
        }
      };

      startTransition(() => {
        void performDeletion();
      });
    } else {
      return;
    }
  }, [cityId, cityName, isPending, navigateBack]);

  return (
    <Button
      icon='remove'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? 'Deleting…' : 'Delete City'}
    </Button>
  );
}
