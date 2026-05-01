/** @format */
/**
 * @file src/app/persons/_components/DeletePersonButton.tsx
 * @description Renders a localized delete person action with confirmation and feedback.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deletePerson } from '@/_actions/person/deletePerson';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { resolvePersonErrorMessage } from '@/_constants/personErrorMessages';
import { useI18n } from '@/_i18n/I18nProvider';

type DeletePersonButtonProps = Readonly<{
  personId: string;
  personName: string;
}>;

export default function DeletePersonButton({
  personId,
  personName,
}: DeletePersonButtonProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleDelete = useCallback(
    function handleDelete(): void {
      if (isPending) {
        return;
      }

      const confirmed =
        globalThis.window?.confirm(
          `${dictionary.persons.delete.confirmTitle.replace(
            '{name}',
            personName,
          )}\n\n${dictionary.persons.delete.confirmBody}`,
        ) ?? false;

      if (!confirmed) {
        return;
      }

      startTransition(async function runDeleteTransition(): Promise<void> {
        const result = await deletePerson(personId);

        if (result.success) {
          toast.success(
            dictionary.persons.delete.success.replace('{name}', personName),
          );
          router.push(NAVIGATION.PERSONS);
          router.refresh();
          return;
        }

        toast.error(
          resolvePersonErrorMessage(
            result.reason
              ? {
                  reason: result.reason,
                  message:
                    result.error ?? dictionary.persons.delete.defaultError,
                  error: result.error ?? dictionary.persons.delete.defaultError,
                }
              : undefined,
            dictionary.persons.errors,
            dictionary.persons.delete.defaultError,
          ),
        );
      });
    },
    [
      dictionary.persons.delete.confirmBody,
      dictionary.persons.delete.confirmTitle,
      dictionary.persons.delete.defaultError,
      dictionary.persons.delete.success,
      dictionary.persons.errors,
      isPending,
      personId,
      personName,
      router,
    ],
  );

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
    >
      {isPending
        ? dictionary.persons.delete.pending
        : dictionary.persons.delete.action}
    </Button>
  );
}
