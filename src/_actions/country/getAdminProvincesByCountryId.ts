/** @format */

'use server';

import API_ROUTES from '@/_constants/apiRoutes';
import getServerAxios from '@/_lib/getServerAxios';
import type { ProvinceAdmin } from '@/_types/country';
import { mapProvince } from './mappers';

export async function getAdminProvincesByCountryId(
  countryId: string,
): Promise<ReadonlyArray<ProvinceAdmin>> {
  if (!countryId.trim()) return [];

  const client = await getServerAxios();

  try {
    const { data } = await client.get<unknown>(
      API_ROUTES.ADMIN_COUNTRY_PROVINCES(countryId),
    );

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).data)
    ) {
      return [];
    }

    const raw = data as { data: Record<string, unknown>[] };
    return raw.data.map(mapProvince);
  } catch (error) {
    console.error(`Failed to fetch admin provinces for country ${countryId}`, error);
    return [];
  }
}
