/** @format */

'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCompetitionPyramidAction } from '@/_actions/competitionStructure/deleteCompetitionPyramidAction';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';
import { useI18n } from '@/_i18n/I18nProvider';
import type { ApiErrorResponse } from '@/_types/api';

type DeleteCompetitionPyramidButtonProps = Readonly<{
  competitionPyramidId: string;
  competitionPyramidName: string;
}>;

function resolveDeleteCompetitionPyramidErrorMessage(
  error: ApiErrorResponse | undefined,
  messages: Readonly<{
    hasRelations: string;
    unexpected: string;
  }>,
): string {
  if (!error) {
    return messages.unexpected;
  }

  switch (error.reason) {
    case 'COMPETITION_PYRAMID_HAS_RELATIONS':
      return messages.hasRelations;
    default:
      return messages.unexpected;
  }
}

export default function DeleteCompetitionPyramidButton({
  competitionPyramidId,
  competitionPyramidName,
}: DeleteCompetitionPyramidButtonProps): React.JSX.Element {
  const router = useRouter();
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const deleteDictionary = dictionary.competitions.pyramids.delete;

  const handleDelete = useCallback(() => {
    if (isPending) return;

    const confirmed =
      globalThis.window?.confirm(
        `${deleteDictionary.confirmTitle}\n\n${deleteDictionary.confirmBody}`,
      ) ?? false;

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCompetitionPyramidAction(competitionPyramidId);

      if (result.status === 'success') {
        toast.success(deleteDictionary.success.replace('{name}', competitionPyramidName));
        router.push(NAVIGATION.COMPETITION_PYRAMIDS);
        router.refresh();
        return;
      }

      if (result.error?.reason === 'COMPETITION_PYRAMID_NOT_FOUND') {
        router.push(NAVIGATION.COMPETITION_PYRAMIDS);
        router.refresh();
        return;
      }

      toast.error(
        resolveDeleteCompetitionPyramidErrorMessage(result.error, {
          hasRelations: deleteDictionary.errors.hasRelations,
          unexpected: deleteDictionary.errors.unexpected,
        }),
      );
    });
  }, [
    competitionPyramidId,
    competitionPyramidName,
    deleteDictionary.confirmBody,
    deleteDictionary.confirmTitle,
    deleteDictionary.errors.hasRelations,
    deleteDictionary.errors.unexpected,
    deleteDictionary.success,
    isPending,
    router,
  ]);

  return (
    <Button
      type='button'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      variant='borderless'
      className='color--red color--red:hover'
    >
      {isPending ? deleteDictionary.pending : deleteDictionary.action}
    </Button>
  );
}
