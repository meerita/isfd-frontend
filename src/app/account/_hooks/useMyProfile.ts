/** @format */

'use client';

import { useMemo } from 'react';

import type { GetMyProfileResponse } from '@/_types/me';

export function useMyProfile(profile: GetMyProfileResponse | null) {
  return useMemo(
    () => ({
      profile,
      hasProfile: Boolean(profile),
    }),
    [profile],
  );
}
