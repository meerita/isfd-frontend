/** @format */

'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { handleUnauthorized } from '@/_actions/account/handleUnauthorized';
import { putMyProfile } from '@/_actions/account/putMyProfile';
import { buildPutMyProfileRequest } from '@/_helpers/account';
import type {
  GetMyProfileResponse,
  ProfileVisibility,
  PutMyProfileResponse,
} from '@/_types/me';
import { ACCOUNT_COPY } from '../_constants/copy';

type ProfileFieldErrors = Readonly<{
  visibility?: string;
  form?: string;
}>;

function buildInitialValues(
  profile: GetMyProfileResponse | null,
): Readonly<{
  display_name: string;
  bio: string;
  avatar_url: string;
  visibility: ProfileVisibility;
}> {
  return {
    display_name: profile?.display_name ?? '',
    bio: profile?.bio ?? '',
    avatar_url: profile?.avatar_url ?? '',
    visibility: profile?.visibility ?? 'public',
  };
}

export function useUpdateMyProfile(initialProfile: GetMyProfileResponse | null) {
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<GetMyProfileResponse | null>(
    initialProfile,
  );
  const [values, setValues] = useState(buildInitialValues(initialProfile));
  const [errors, setErrors] = useState<ProfileFieldErrors>({});

  const summary = useMemo(
    () => ({
      profile,
      values,
      errors,
      isPending,
      hasProfile: Boolean(profile),
    }),
    [errors, isPending, profile, values],
  );

  function setFieldValue(
    field: keyof typeof values,
    value: string | ProfileVisibility,
  ): void {
    setValues(previous => ({
      ...previous,
      [field]: value,
    }));

    setErrors(previous => ({
      ...previous,
      visibility: field === 'visibility' ? undefined : previous.visibility,
      form: undefined,
    }));
  }

  function submit(): void {
    startTransition(async function saveProfile() {
      const response = await putMyProfile(buildPutMyProfileRequest(values));

      if (response.error?.code === 'UNAUTHORIZED') {
        await handleUnauthorized();
      }

      if (!response.data) {
        if (response.error?.code === 'INVALID_PROFILE_VISIBILITY') {
          setErrors({
            visibility: ACCOUNT_COPY.profile.invalidVisibility,
          });
        } else if (response.error?.code === 'BAD_REQUEST') {
          setErrors({
            form: ACCOUNT_COPY.profile.invalidForm,
          });
          toast.error(ACCOUNT_COPY.profile.invalidForm);
        } else {
          toast.error(response.error?.message ?? ACCOUNT_COPY.profile.saveError);
        }

        return;
      }

      setProfile(response.data);
      setValues(buildInitialValues(response.data));
      setErrors({});
      toast.success(ACCOUNT_COPY.profile.success);
    });
  }

  return {
    ...summary,
    setFieldValue,
    submit,
  };
}
