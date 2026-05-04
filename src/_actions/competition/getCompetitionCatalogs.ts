/** @format */

'use server';

import type { ApiErrorResponse } from '@/_types/api';
import type {
  CompetitionPyramid,
  CompetitionTier,
} from '@/_types/competitionStructure';
import type { CompetitionType } from '@/_types/competitionType';
import type { Country } from '@/_types/country';
import type { FederationListItem } from '@/_types/federation';
import { getAdminCompetitionTiers } from '../competitionStructure/getAdminCompetitionTiers';
import { getAdminCompetitionPyramids } from '../competitionStructure/getAdminCompetitionPyramids';
import { getAdminCompetitionTypes } from '../competitionType/getAdminCompetitionTypes';
import { getAdminCountries } from '../country/getCountries';
import { getAdminFederations } from '../federation/getAdminFederations';

export type CompetitionBaseCatalogs = Readonly<{
  competitionTypes: ReadonlyArray<CompetitionType>;
  federations: ReadonlyArray<FederationListItem>;
  countries: ReadonlyArray<Country>;
  competitionPyramids: ReadonlyArray<CompetitionPyramid>;
  error?: ApiErrorResponse;
}>;

export async function getCompetitionBaseCatalogs(): Promise<CompetitionBaseCatalogs> {
  const [
    competitionTypesResponse,
    federationsResponse,
    countriesResponse,
    competitionPyramidsResponse,
  ] = await Promise.all([
    getAdminCompetitionTypes({
      page: 1,
      pageSize: 100,
      status: 'active',
      sort: 'sort_order_asc',
    }),
    getAdminFederations({
      page: 1,
      pageSize: 100,
      status: 'active',
      sort: 'name_asc',
    }),
    getAdminCountries({
      page: 1,
      pageSize: 100,
      status: 'active',
      sort: 'name_asc',
    }),
    getAdminCompetitionPyramids({
      page: 1,
      pageSize: 100,
      status: 'active',
      sort: 'name_asc',
    }),
  ]);

  return {
    competitionTypes: competitionTypesResponse.data,
    federations: federationsResponse.data,
    countries: countriesResponse.data,
    competitionPyramids: competitionPyramidsResponse.data,
    error:
      competitionTypesResponse.error ??
      federationsResponse.error ??
      countriesResponse.error ??
      competitionPyramidsResponse.error,
  };
}

export type CompetitionTierCatalogResult = Readonly<{
  competitionTiers: ReadonlyArray<CompetitionTier>;
  error?: ApiErrorResponse;
}>;

export async function getCompetitionTierCatalog(
  competitionPyramidId: string,
  participantScope?: string | null,
): Promise<CompetitionTierCatalogResult> {
  if (!competitionPyramidId) {
    return { competitionTiers: [] };
  }

  const response = await getAdminCompetitionTiers({
    page: 1,
    pageSize: 100,
    status: 'active',
    sort: 'name_asc',
    competitionPyramidId,
    participantScope: participantScope ?? undefined,
  });

  return {
    competitionTiers: response.data,
    error: response.error,
  };
}
