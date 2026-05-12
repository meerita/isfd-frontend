/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type {
  MeApiResult,
  MyContributionsListResponse,
  MyContributionsQuery,
} from '@/_types/me';
import { buildMeFailureResult, buildMeSuccessResult } from './_shared';

export async function getMyContributions(
  query: MyContributionsQuery = {},
): Promise<MeApiResult<MyContributionsListResponse>> {
  const client = await getServerAxios();

  try {
    const { data } = await client.get<MyContributionsListResponse>(
      API_ROUTES.ME_CONTRIBUTIONS,
      {
        params: query,
      },
    );
    return buildMeSuccessResult(data);
  } catch (error) {
    return buildMeFailureResult(error);
  }
}
