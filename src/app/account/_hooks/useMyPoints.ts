/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import type { GetMyPointsResponse, MeApiResult } from '@/_types/me';

export function useMyPoints(pointsResult: MeApiResult<GetMyPointsResponse>) {
  const router = useRouter();

  return useMemo(
    () => ({
      points: pointsResult.data,
      error: pointsResult.error,
      retry() {
        router.refresh();
      },
    }),
    [pointsResult.data, pointsResult.error, router],
  );
}
