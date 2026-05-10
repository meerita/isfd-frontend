/** @format */

'use client';

import { useMemo } from 'react';

import type { GetMyProfileResponse, MeResponse } from '@/_types/me';

export function useMe(
  me: MeResponse,
  profile: GetMyProfileResponse | null,
): Readonly<{
  displayName: string;
  avatarUrl: string | null;
}> {
  return useMemo(
    () => ({
      displayName:
        profile?.display_name?.trim() || me.username.trim() || me.email.trim(),
      avatarUrl: profile?.avatar_url ?? null,
    }),
    [me.email, me.username, profile?.avatar_url, profile?.display_name],
  );
}
