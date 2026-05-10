/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { CurrentSessionResponse, MeApiResult } from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function getCurrentSession(): Promise<
  MeApiResult<CurrentSessionResponse>
> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<CurrentSessionResponse>(
      API_ROUTES.SESSIONS_CURRENT,
    );
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error);
  }
}
