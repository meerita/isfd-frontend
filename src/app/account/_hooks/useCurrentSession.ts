/** @format */

'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import type { CurrentSessionResponse, MeApiResult } from '@/_types/me';

export function useCurrentSession(
  sessionResult: MeApiResult<CurrentSessionResponse>,
) {
  const router = useRouter();

  return useMemo(
    () => ({
      session: sessionResult.data,
      error: sessionResult.error,
      retry() {
        router.refresh();
      },
    }),
    [router, sessionResult.data, sessionResult.error],
  );
}
