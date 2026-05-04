/** @format */

import type {
  CompetitionPyramidBranchKind,
  CompetitionPyramidScopeKind,
  CompetitionStructureBranchKind,
  CompetitionTierScopeKind,
  ParticipantScope,
} from '@/_constants/enums/competition';
import type { ApiErrorResponse } from '@/_types/api';
import type { GeoMetadata } from '@/_types/country';

export type CompetitionStructureSort =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'updated_at_asc'
  | 'updated_at_desc'
  | 'name_asc'
  | 'name_desc';

export type CompetitionStructureStatusFilter = 'all' | 'active' | 'inactive';

export type CompetitionPyramid = Readonly<{
  id: string;
  versionId: string | null;
  countryId: string;
  federationId: string | null;
  code: string;
  slug: string;
  name: string;
  scopeKind: CompetitionPyramidScopeKind;
  branchKind: CompetitionPyramidBranchKind | null;
  isActive: boolean;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionTier = Readonly<{
  id: string;
  versionId: string | null;
  competitionPyramidId: string;
  parentTierId: string | null;
  parentTierVersionId: string | null;
  code: string;
  slug: string;
  name: string;
  shortName: string | null;
  levelOrder: number | null;
  scopeKind: CompetitionTierScopeKind;
  branchKind: CompetitionStructureBranchKind | null;
  participantScope: ParticipantScope;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type CompetitionPyramidListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionStructureSort;
      status?: CompetitionStructureStatusFilter;
      countryId?: string;
      federationId?: string;
      scopeKind?: CompetitionPyramidScopeKind;
      branchKind?: CompetitionPyramidBranchKind;
      asOfDate?: string;
    }>;
  }>;

export type CompetitionTierListMetadata = GeoMetadata &
  Readonly<{
    filters?: Readonly<{
      sort?: CompetitionStructureSort;
      status?: CompetitionStructureStatusFilter;
      competitionPyramidId?: string;
      parentTierId?: string;
      participantScope?: ParticipantScope;
      scopeKind?: CompetitionTierScopeKind;
      branchKind?: CompetitionStructureBranchKind;
      asOfDate?: string;
    }>;
  }>;

export type CompetitionPyramidListResponse = Readonly<{
  data: ReadonlyArray<CompetitionPyramid>;
  metadata: CompetitionPyramidListMetadata;
  error?: ApiErrorResponse;
}>;

export type CompetitionTierListResponse = Readonly<{
  data: ReadonlyArray<CompetitionTier>;
  metadata: CompetitionTierListMetadata;
  error?: ApiErrorResponse;
}>;

export type CompetitionPyramidDetailResponse = Readonly<{
  data: CompetitionPyramid | null;
  error?: ApiErrorResponse;
}>;

export type CompetitionTierDetailResponse = Readonly<{
  data: CompetitionTier | null;
  error?: ApiErrorResponse;
}>;

export type CreateCompetitionPyramidRequest = Readonly<{
  country_id: string;
  federation_id: string | null;
  code: string;
  name: string;
  scope_kind: CompetitionPyramidScopeKind;
  branch_kind: CompetitionPyramidBranchKind;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
}>;

export type UpdateCompetitionPyramidRequest = Readonly<{
  country_id?: string | null;
  federation_id?: string | null;
  code?: string | null;
  name?: string | null;
  scope_kind?: CompetitionPyramidScopeKind | null;
  branch_kind?: CompetitionPyramidBranchKind | null;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active?: boolean | null;
}>;

export type CreateCompetitionTierRequest = Readonly<{
  competition_pyramid_id: string;
  parent_tier_id: string | null;
  code: string;
  name: string;
  short_name: string | null;
  level_order: number | null;
  scope_kind: CompetitionTierScopeKind;
  participant_scope: ParticipantScope;
  is_active?: boolean | null;
}>;

export type UpdateCompetitionTierRequest = Readonly<{
  competition_pyramid_id?: string | null;
  parent_tier_id?: string | null;
  code?: string | null;
  name?: string | null;
  short_name?: string | null;
  level_order?: number | null;
  scope_kind?: CompetitionTierScopeKind | null;
  participant_scope?: ParticipantScope | null;
  is_active?: boolean | null;
}>;

export interface CompetitionPyramidActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionPyramidId?: string;
}

export interface CompetitionTierActionState {
  status: 'idle' | 'success' | 'error';
  error?: ApiErrorResponse;
  competitionTierId?: string;
}
