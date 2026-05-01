/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteBrand } from '@/_actions/brand/deleteBrand';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedBrandErrorMessage } from '@/_constants/brandErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';

type DeleteBrandButtonProps = Readonly<{
  brandId: string;
  brandName: string;
}>;

export default function DeleteBrandButton({
  brandId,
  brandName,
}: DeleteBrandButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { dictionary } = useI18n();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `${dictionary.brands.delete.confirmTitle.replace('{name}', brandName)}\n\n${
          dictionary.brands.delete.confirmBody
        }`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteBrand(brandId);

      if (result.success) {
        toast.success(dictionary.brands.delete.success.replace('{name}', brandName));
        router.push(NAVIGATION.BRANDS);
        router.refresh();
        return;
      }

      toast.error(
        resolveLocalizedBrandErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? dictionary.brands.delete.defaultError,
                error: result.error ?? dictionary.brands.delete.defaultError,
              }
            : undefined,
          dictionary.brands.errors,
          dictionary.common.unexpectedError,
        ),
      );
    });
  }, [brandId, brandName, dictionary, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? dictionary.brands.delete.pending : dictionary.brands.delete.action}
    </Button>
  );
}
