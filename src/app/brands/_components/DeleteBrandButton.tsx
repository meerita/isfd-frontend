/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteBrand } from '@/_actions/brand/deleteBrand';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveBrandErrorMessage } from '@/_constants/brandErrorMessages';

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

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${brandName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteBrand(brandId);

      if (result.success) {
        toast.success(`"${brandName}" deleted.`);
        router.push(NAVIGATION.BRANDS);
        router.refresh();
        return;
      }

      toast.error(
        resolveBrandErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? 'We could not delete this brand.',
                error: result.error ?? 'We could not delete this brand.',
              }
            : undefined,
        ),
      );
    });
  }, [brandId, brandName, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete brand'}
    </Button>
  );
}
