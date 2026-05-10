/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { GetMyProfileResponse, MeApiResult } from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function getMyProfile(): Promise<
  MeApiResult<GetMyProfileResponse>
> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<GetMyProfileResponse>(API_ROUTES.ME_PROFILE);
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error, {
      silentCodes: ['PROFILE_NOT_FOUND'],
    });
  }
}
