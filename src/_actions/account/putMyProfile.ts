/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  MeApiResult,
  PutMyProfileRequest,
  PutMyProfileResponse,
} from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function putMyProfile(
  payload: PutMyProfileRequest,
): Promise<MeApiResult<PutMyProfileResponse>> {
  const client = await getServerAxios();

  try {
    const { data } = await client.put<PutMyProfileResponse>(
      API_ROUTES.ME_PROFILE,
      payload,
    );
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error);
  }
}
