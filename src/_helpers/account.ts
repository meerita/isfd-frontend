/** @format */

import NAVIGATION from '@/_constants/navigation';
import {
  DEFAULT_ACCOUNT_SECTION,
  DEFAULT_MY_CONTRIBUTIONS_PAGE,
  DEFAULT_MY_CONTRIBUTIONS_PAGE_SIZE,
  DEFAULT_MY_CONTRIBUTIONS_REVIEW_STATUS,
  DEFAULT_MY_CONTRIBUTIONS_SORT,
  DEFAULT_MY_CONTRIBUTIONS_TARGET_ENTITY_TYPE,
  type AccountSection,
  parseMyContributionReviewStatus,
  parseMyContributionSort,
  parseMyContributionTargetEntityType,
} from '@/_constants/account';
import type {
  MyContributionsQuery,
  PutMyProfileRequest,
  ProfileVisibility,
} from '@/_types/me';

type RawSearchValue = string | string[] | undefined;

export type ProfileFormValues = Readonly<{
  display_name: string;
  bio: string;
  avatar_url: string;
  visibility: ProfileVisibility;
}>;

export function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function buildPutMyProfileRequest(
  values: ProfileFormValues,
): PutMyProfileRequest {
  return {
    display_name: normalizeNullableText(values.display_name),
    bio: normalizeNullableText(values.bio),
    avatar_url: normalizeNullableText(values.avatar_url),
    visibility: values.visibility,
  };
}

export function parsePositiveInteger(
  value: RawSearchValue,
  fallback: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function parseSingleValue(value: RawSearchValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim() : undefined;
}

export type AccountSearchParams = Readonly<{
  section?: RawSearchValue;
  page?: RawSearchValue;
  page_size?: RawSearchValue;
  sort?: RawSearchValue;
  review_status?: RawSearchValue;
  target_entity_type?: RawSearchValue;
}>;

export type ParsedMyContributionsSearchState = Readonly<{
  page: number;
  page_size: number;
  sort: NonNullable<MyContributionsQuery['sort']>;
  review_status: NonNullable<MyContributionsQuery['review_status']>;
  target_entity_type: NonNullable<MyContributionsQuery['target_entity_type']>;
}>;

export function parseMyContributionsSearchState(
  searchParams?: AccountSearchParams,
): ParsedMyContributionsSearchState {
  return {
    page: parsePositiveInteger(
      searchParams?.page,
      DEFAULT_MY_CONTRIBUTIONS_PAGE,
    ),
    page_size: parsePositiveInteger(
      searchParams?.page_size,
      DEFAULT_MY_CONTRIBUTIONS_PAGE_SIZE,
    ),
    sort:
      parseMyContributionSort(parseSingleValue(searchParams?.sort)) ??
      DEFAULT_MY_CONTRIBUTIONS_SORT,
    review_status:
      parseMyContributionReviewStatus(
        parseSingleValue(searchParams?.review_status),
      ) ?? DEFAULT_MY_CONTRIBUTIONS_REVIEW_STATUS,
    target_entity_type:
      parseMyContributionTargetEntityType(
        parseSingleValue(searchParams?.target_entity_type),
      ) ?? DEFAULT_MY_CONTRIBUTIONS_TARGET_ENTITY_TYPE,
  };
}

export function buildAccountHref(options?: {
  section?: AccountSection;
  contributions?: Partial<ParsedMyContributionsSearchState>;
}): string {
  const params = new URLSearchParams();
  const section = options?.section ?? DEFAULT_ACCOUNT_SECTION;

  params.set('section', section);

  if (section === 'contributions') {
    const contributions = {
      ...parseMyContributionsSearchState(),
      ...options?.contributions,
    };

    params.set('page', String(contributions.page));
    params.set('page_size', String(contributions.page_size));
    params.set('sort', contributions.sort);
    params.set('review_status', contributions.review_status);
    params.set('target_entity_type', contributions.target_entity_type);
  }

  return `${NAVIGATION.ACCOUNT}?${params.toString()}`;
}

export function buildMyContributionsFilterHref(
  currentState: ParsedMyContributionsSearchState,
  nextFilters: Partial<
    Pick<
      ParsedMyContributionsSearchState,
      'sort' | 'review_status' | 'target_entity_type'
    >
  >,
): string {
  return buildAccountHref({
    section: 'contributions',
    contributions: {
      ...currentState,
      ...nextFilters,
      page: DEFAULT_MY_CONTRIBUTIONS_PAGE,
    },
  });
}
