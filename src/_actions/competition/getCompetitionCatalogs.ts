/** @format */

'use server';

import type { ApiErrorResponse } from '@/_types/api';
import type { CompetitionType } from '@/_types/competitionType';
import type { Country } from '@/_types/country';
import type { FederationListItem } from '@/_types/federation';
import { getAdminCompetitionTypes } from '../competitionType/getAdminCompetitionTypes';
import { getAdminCountries } from '../country/getCountries';
import { getAdminFederations } from '../federation/getAdminFederations';

export type CompetitionBaseCatalogs = Readonly<{
  competitionTypes: ReadonlyArray<CompetitionType>;
  federations: ReadonlyArray<FederationListItem>;
  countries: ReadonlyArray<Country>;
  error?: ApiErrorResponse;
}>;

export async function getCompetitionBaseCatalogs(): Promise<CompetitionBaseCatalogs> {
  const [
    competitionTypesResponse,
    federationsResponse,
    countriesResponse,
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
  ]);

  return {
    competitionTypes: competitionTypesResponse.data,
    federations: federationsResponse.data,
    countries: countriesResponse.data,
    error:
      competitionTypesResponse.error ??
      federationsResponse.error ??
      countriesResponse.error,
  };
}
