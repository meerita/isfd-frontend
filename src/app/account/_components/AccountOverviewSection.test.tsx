/** @format */

import { expect, mock, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

test('renders identity content even when the points block is degraded', async () => {
  mock.module('next/navigation', () => ({
    useRouter: () => ({
      refresh() {},
      prefetch() {},
      push() {},
    }),
  }));

  const { default: AccountOverviewSection } = await import(
    './AccountOverviewSection'
  );

  const markup = renderToStaticMarkup(
    <AccountOverviewSection
      me={{
        user_id: 'user-1',
        username: 'diego',
        email: 'diego@example.com',
        platform_role: 'admin',
        status: 'active',
        session_id: 'session-1',
        issued_at: '2026-01-01T00:00:00Z',
        expires_at: '2026-01-01T01:00:00Z',
      }}
      profile={null}
      pointsResult={{
        data: null,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudieron cargar tus puntos.',
        },
        statusCode: 500,
      }}
    />,
  );

  expect(markup).toContain('diego');
  expect(markup).toContain('diego@example.com');
  expect(markup).toContain('No se pudieron cargar tus puntos.');
  expect(markup).not.toContain('user-1');
  expect(markup).not.toContain('session-1');
});
