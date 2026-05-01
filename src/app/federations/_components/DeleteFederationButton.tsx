/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteFederation } from '@/_actions/federation/deleteFederation';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolveLocalizedFederationErrorMessage } from '@/_constants/federationErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';

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
  const { dictionary } = useI18n();

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `${dictionary.federations.delete.confirmTitle.replace('{name}', federationName)}\n\n${
          dictionary.federations.delete.confirmBody
        }`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteFederation(federationId);

      if (result.success) {
        toast.success(
          dictionary.federations.delete.success.replace('{name}', federationName),
        );
        router.push(NAVIGATION.FEDERATIONS);
        router.refresh();
        return;
      }

      toast.error(
        resolveLocalizedFederationErrorMessage(
          result.reason
            ? {
                reason: result.reason,
                message: result.error ?? dictionary.federations.delete.defaultError,
                error: result.error ?? dictionary.federations.delete.defaultError,
              }
            : undefined,
          dictionary.federations.errors,
          dictionary.common.unexpectedError,
        ),
      );
    });
  }, [dictionary, federationId, federationName, isPending, router]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending
        ? dictionary.federations.delete.pending
        : dictionary.federations.delete.action}
    </Button>
  );
}
