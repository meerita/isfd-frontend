/** @format */

'use server';

import { revalidatePath } from 'next/cache';

import API_ROUTES from '@/_constants/apiRoutes';
import NAVIGATION from '@/_constants/navigation';
import { logApiError, normalizeApiError } from '@/_lib/apiError';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  ContributionReviewResult,
  ContributionTargetEntityType,
} from '@/_types/contribution';

function revalidateContributionTarget(
  targetEntityType?: ContributionTargetEntityType,
  targetEntityId?: string,
): void {
  if (!targetEntityType || !targetEntityId) return;

  if (targetEntityType === 'STADIUM') {
    revalidatePath(NAVIGATION.STADIUM_BY_ID(targetEntityId));
    return;
  }

  if (targetEntityType === 'PERSON') {
    revalidatePath(NAVIGATION.PERSON_BY_ID(targetEntityId));
  }
}

export async function approveContribution(
  contributionId: string,
  target?: Readonly<{
    targetEntityType?: ContributionTargetEntityType;
    targetEntityId?: string;
  }>,
): Promise<ContributionReviewResult> {
  if (!contributionId) {
    return {
      success: false,
      reason: 'CONTRIBUTION_ID_REQUIRED',
      error: 'Missing contribution identifier.',
    };
  }

  const client = await getServerAxios();

  try {
    await client.post(API_ROUTES.CONTRIBUTION_ADMIN_APPROVE(contributionId));
    revalidatePath(NAVIGATION.CONTRIBUTIONS);
    revalidatePath(NAVIGATION.CONTRIBUTION_BY_ID(contributionId));
    revalidateContributionTarget(target?.targetEntityType, target?.targetEntityId);

    return { success: true };
  } catch (caughtError) {
    const normalized = normalizeApiError(caughtError);
    logApiError(normalized);

    return {
      success: false,
      reason: normalized.data.reason,
      error: normalized.data.error ?? normalized.data.message,
    };
  }
}
