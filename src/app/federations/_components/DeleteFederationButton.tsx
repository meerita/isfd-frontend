/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteFederation } from '@/_actions/federation/deleteFederation';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';

const DELETE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  FEDERATION_HAS_RELATIONS:
    'This federation cannot be deleted because it is still linked to other records.',
  FEDERATION_NOT_FOUND: 'This federation no longer exists.',
};

type DeleteFederationButtonProps = Readonly<{
  federationId: string;
  federationName: string;
}>;

export default function DeleteFederationButton({
  federationId,
  federationName,
}: DeleteFederationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `Delete "${federationName}"?\n\nThis action cannot be undone.`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteFederation(federationId);

      if (result.success) {
        toast.success(`"${federationName}" deleted.`);
        router.push(NAVIGATION.FEDERATIONS);
        router.refresh();
        return;
      }

      toast.error(
        (result.reason && DELETE_ERROR_MESSAGES[result.reason]) ||
          result.error ||
          'We could not delete this federation.',
      );
    });
  }, [federationId, federationName, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending ? 'Deleting...' : 'Delete federation'}
    </Button>
  );
}
