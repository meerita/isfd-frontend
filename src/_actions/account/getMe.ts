/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { MeApiResult, MeResponse } from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function getMe(): Promise<MeApiResult<MeResponse>> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<MeResponse>(API_ROUTES.ME);
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error);
  }
}
