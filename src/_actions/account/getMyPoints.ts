/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { GetMyPointsResponse, MeApiResult } from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function getMyPoints(): Promise<MeApiResult<GetMyPointsResponse>> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<GetMyPointsResponse>(API_ROUTES.ME_POINTS);
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error);
  }
}
