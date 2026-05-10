/** @format */

import { describe, expect, test } from 'bun:test';

import {
  buildMyContributionsFilterHref,
  buildPutMyProfileRequest,
  parseMyContributionsSearchState,
} from './account';

describe('account helpers', () => {
  test('buildPutMyProfileRequest converts empty strings to null', () => {
    expect(
      buildPutMyProfileRequest({
        display_name: '  ',
        bio: '  Bio  ',
        avatar_url: '',
        visibility: 'public',
      }),
    ).toEqual({
      display_name: null,
      bio: 'Bio',
      avatar_url: null,
      visibility: 'public',
    });
  });

  test('parseMyContributionsSearchState falls back to safe defaults', () => {
    expect(
      parseMyContributionsSearchState({
        page: '0',
        page_size: '-10',
        sort: 'invalid',
        review_status: 'wrong',
        target_entity_type: 'unknown',
      }),
    ).toEqual({
      page: 1,
      page_size: 20,
      sort: 'created_at_desc',
      review_status: 'all',
      target_entity_type: 'all',
    });
  });

  test('buildMyContributionsFilterHref resets page to 1 when filters change', () => {
    expect(
      buildMyContributionsFilterHref(
        {
          page: 4,
          page_size: 20,
          sort: 'created_at_desc',
          review_status: 'all',
          target_entity_type: 'all',
        },
        {
          review_status: 'approved',
        },
      ),
    ).toContain('page=1');
  });
});
