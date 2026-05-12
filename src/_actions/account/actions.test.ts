/** @format */

import { describe, expect, mock, test } from 'bun:test';
import { AxiosError } from 'axios';

import type { ApiError } from '@/_types/api';
import type { MeResponse } from '@/_types/me';

function createAxiosError(status: number, error: ApiError): AxiosError {
  return new AxiosError(
    error.message,
    undefined,
    undefined,
    undefined,
    {
      data: error,
      status,
      statusText: '',
      headers: {},
      config: {
        headers: {},
      } as never,
    },
  );
}

describe('account actions', () => {
  test('getMe returns the /me payload on success', async () => {
    const client = {
      get: mock(async () => ({
        data: {
          user_id: 'user-1',
          username: 'diego',
          email: 'diego@example.com',
          platform_role: 'admin',
          status: 'active',
          session_id: 'session-1',
          issued_at: '2026-01-01T00:00:00Z',
          expires_at: '2026-01-01T01:00:00Z',
        } satisfies MeResponse,
      })),
    };

    mock.module('@/_lib/getServerAxios', () => ({
      default: async () => client,
    }));

    const { getMe } = await import('./getMe');
    const result = await getMe();

    expect(result.data?.username).toBe('diego');
    expect(client.get).toHaveBeenCalledWith('/me');
  });

  test('getMyContributions serializes supported query params', async () => {
    const client = {
      get: mock(async () => ({
        data: {
          data: [],
          metadata: {
            page: 2,
            page_size: 10,
            total_items: 0,
            total_pages: 0,
            has_next_page: false,
            has_previous_page: true,
            filters: {
              sort: 'updated_at_desc',
              review_status: 'approved',
              target_entity_type: 'person',
            },
          },
        },
      })),
    };

    mock.module('@/_lib/getServerAxios', () => ({
      default: async () => client,
    }));

    const { getMyContributions } = await import('./getMyContributions');

    await getMyContributions({
      page: 2,
      page_size: 10,
      sort: 'updated_at_desc',
      review_status: 'approved',
      target_entity_type: 'person',
    });

    expect(client.get).toHaveBeenCalledWith('/me/contributions', {
      params: {
        page: 2,
        page_size: 10,
        sort: 'updated_at_desc',
        review_status: 'approved',
        target_entity_type: 'person',
      },
    });
  });

  test('putMyProfile sends the exact backend body', async () => {
    const client = {
      put: mock(async () => ({
        data: {
          user_id: 'user-1',
          display_name: 'Diego',
          bio: null,
          avatar_url: null,
          visibility: 'public',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T01:00:00Z',
        },
      })),
    };

    mock.module('@/_lib/getServerAxios', () => ({
      default: async () => client,
    }));

    const { putMyProfile } = await import('./putMyProfile');
    const payload = {
      display_name: 'Diego',
      bio: null,
      avatar_url: null,
      visibility: 'public' as const,
    };

    await putMyProfile(payload);

    expect(client.put).toHaveBeenCalledWith('/me/profile', payload);
  });

  test('getMyProfile normalizes 401 errors', async () => {
    const client = {
      get: mock(async () => {
        throw createAxiosError(401, {
          code: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para continuar.',
        });
      }),
    };

    mock.module('@/_lib/getServerAxios', () => ({
      default: async () => client,
    }));

    const { getMyProfile } = await import('./getMyProfile');
    const result = await getMyProfile();

    expect(result.error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Debes iniciar sesión para continuar.',
      details: undefined,
    });
    expect(result.statusCode).toBe(401);
  });
});
