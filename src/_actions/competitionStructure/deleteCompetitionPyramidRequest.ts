/** @format */

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';

export async function deleteCompetitionPyramidRequest(
  competitionPyramidId: string,
): Promise<void> {
  const client = await getServerAxios();

  await client.delete(
    API_ROUTES.COMPETITION_PYRAMID_ADMIN_BY_ID(competitionPyramidId),
  );
}
