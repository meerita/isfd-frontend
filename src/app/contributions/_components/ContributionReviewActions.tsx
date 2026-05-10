/** @format */

'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { approveContribution } from '@/_actions/contribution/approveContribution';
import { rejectContribution } from '@/_actions/contribution/rejectContribution';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import { resolveContributionErrorMessage } from '@/_constants/contributionErrorMessages';
import type {
  ContributionReviewStatus,
  ContributionTargetEntityType,
} from '@/_types/contribution';
import { useI18n } from '@/_i18n/I18nProvider';

type ContributionReviewActionsProps = Readonly<{
  contributionId: string;
  reviewStatus: ContributionReviewStatus;
  targetEntityType: ContributionTargetEntityType;
  targetEntityId: string;
  detailHref?: string;
}>;

export default function ContributionReviewActions({
  contributionId,
  reviewStatus,
  targetEntityType,
  targetEntityId,
  detailHref,
}: ContributionReviewActionsProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { dictionary } = useI18n();

  const isReviewable = reviewStatus === 'PENDING';
  const disabledMessage = useMemo(() => {
    if (isReviewable) return '';
    return dictionary.contributions.actions.alreadyReviewed;
  }, [dictionary.contributions.actions.alreadyReviewed, isReviewable]);

  const stopContainerClick = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.stopPropagation();
    },
    [],
  );

  const stopRowNavigation = useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleApprove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      stopRowNavigation(event);
      if (!isReviewable || isPending) return;

      const confirmed =
        globalThis.window?.confirm(
          `${dictionary.contributions.actions.approveConfirmTitle}\n\n${dictionary.contributions.actions.approveConfirmBody}`,
        ) ?? false;

      if (!confirmed) return;

      startTransition(async () => {
        const result = await approveContribution(contributionId, {
          targetEntityType,
          targetEntityId,
        });

        if (result.success) {
          toast.success(dictionary.contributions.actions.approveSuccess);
          router.refresh();
          return;
        }

        toast.error(
          resolveContributionErrorMessage(
            result.reason
              ? {
                  reason: result.reason,
                  message:
                    result.error ?? dictionary.contributions.actions.defaultError,
                  error:
                    result.error ?? dictionary.contributions.actions.defaultError,
                }
              : undefined,
            dictionary.contributions.errors,
            dictionary.contributions.actions.defaultError,
          ),
        );
      });
    },
    [
      contributionId,
      dictionary.contributions.actions.approveConfirmBody,
      dictionary.contributions.actions.approveConfirmTitle,
      dictionary.contributions.actions.approveSuccess,
      dictionary.contributions.actions.defaultError,
      dictionary.contributions.errors,
      isPending,
      isReviewable,
      router,
      stopRowNavigation,
      targetEntityId,
      targetEntityType,
    ],
  );

  const handleReject = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      stopRowNavigation(event);
      if (!isReviewable || isPending) return;

      const confirmed =
        globalThis.window?.confirm(
          `${dictionary.contributions.actions.rejectConfirmTitle}\n\n${dictionary.contributions.actions.rejectConfirmBody}`,
        ) ?? false;

      if (!confirmed) return;

      startTransition(async () => {
        const result = await rejectContribution(contributionId, {
          targetEntityType,
          targetEntityId,
        });

        if (result.success) {
          toast.success(dictionary.contributions.actions.rejectSuccess);
          router.refresh();
          return;
        }

        toast.error(
          resolveContributionErrorMessage(
            result.reason
              ? {
                  reason: result.reason,
                  message:
                    result.error ?? dictionary.contributions.actions.defaultError,
                  error:
                    result.error ?? dictionary.contributions.actions.defaultError,
                }
              : undefined,
            dictionary.contributions.errors,
            dictionary.contributions.actions.defaultError,
          ),
        );
      });
    },
    [
      contributionId,
      dictionary.contributions.actions.defaultError,
      dictionary.contributions.actions.rejectConfirmBody,
      dictionary.contributions.actions.rejectConfirmTitle,
      dictionary.contributions.actions.rejectSuccess,
      dictionary.contributions.errors,
      isPending,
      isReviewable,
      router,
      stopRowNavigation,
      targetEntityId,
      targetEntityType,
    ],
  );

  return (
    <Grid display='flex' gap={4} onClick={stopContainerClick}>
      {detailHref ? (
        <Button href={detailHref} variant='borderless'>
          {dictionary.contributions.actions.view}
        </Button>
      ) : null}
      <Button
        type='button'
        variant='borderless'
        onClick={handleApprove}
        disabled={!isReviewable || isPending}
        title={disabledMessage || undefined}
      >
        {isPending
          ? dictionary.contributions.actions.approvePending
          : dictionary.contributions.actions.approve}
      </Button>
      <Button
        type='button'
        variant='borderless'
        onClick={handleReject}
        disabled={!isReviewable || isPending}
        title={disabledMessage || undefined}
      >
        {isPending
          ? dictionary.contributions.actions.rejectPending
          : dictionary.contributions.actions.reject}
      </Button>
    </Grid>
  );
}
